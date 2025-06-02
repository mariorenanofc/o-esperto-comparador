
import { NextRequest, NextResponse } from 'next/server';
import { WebhookEvent } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { prisma } from '@/lib/prisma';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET environment variable');
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(webhookSecret);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400,
    });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  if (eventType === 'user.created') {
    try {
      await prisma.user.create({
        data: {
          id: id!,
          email: evt.data.email_addresses[0]?.email_address || '',
          name: `${evt.data.first_name || ''} ${evt.data.last_name || ''}`.trim() || null,
        },
      });
      console.log(`User ${id} created in database`);
    } catch (error) {
      console.error('Error creating user in database:', error);
    }
  }

  if (eventType === 'user.updated') {
    try {
      await prisma.user.update({
        where: { id: id! },
        data: {
          email: evt.data.email_addresses[0]?.email_address || '',
          name: `${evt.data.first_name || ''} ${evt.data.last_name || ''}`.trim() || null,
        },
      });
      console.log(`User ${id} updated in database`);
    } catch (error) {
      console.error('Error updating user in database:', error);
    }
  }

  if (eventType === 'user.deleted') {
    try {
      await prisma.user.delete({
        where: { id: id! },
      });
      console.log(`User ${id} deleted from database`);
    } catch (error) {
      console.error('Error deleting user from database:', error);
    }
  }

  return new Response('', { status: 200 });
}

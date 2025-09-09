import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, DollarSign, TrendingUp, Users } from "lucide-react";
import { SubscriptionStatsCard } from "@/components/admin/SubscriptionStatsCard";

const Billing: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Faturamento e Assinaturas</h1>
        <p className="text-muted-foreground">
          Acompanhe receitas, assinaturas e métricas financeiras
        </p>
      </div>

      {/* Revenue Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Mensal
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">R$ 45,231</div>
            <p className="text-xs text-muted-foreground">
              +20.1% desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Assinantes Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">2,341</div>
            <p className="text-xs text-muted-foreground">
              +180 novos este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Conversão
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">12.5%</div>
            <p className="text-xs text-muted-foreground">
              +2.3% desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita por Usuário
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">R$ 19.32</div>
            <p className="text-xs text-muted-foreground">
              +8.1% desde o mês passado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Breakdown */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <SubscriptionStatsCard 
          subscriptionData={{
            totalInvested: 45231,
            monthsSubscribed: 12,
            firstPaymentDate: new Date('2023-01-15'),
            lastPaymentDate: new Date('2024-01-15'),
            planEndDate: new Date('2024-02-15'),
            nextBillingDate: new Date('2024-02-15'),
            accessSuspended: false
          }}
          paymentHistory={[]}
          currentPlan="premium"
          onRefresh={() => {}}
        />
        
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Planos</CardTitle>
            <CardDescription>
              Percentual de usuários por tipo de plano
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Gratuito</span>
                <span className="text-sm text-muted-foreground">68%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '68%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Premium</span>
                <span className="text-sm text-muted-foreground">24%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '24%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Pro</span>
                <span className="text-sm text-muted-foreground">8%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '8%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Churn Rate</CardTitle>
            <CardDescription>
              Taxa de cancelamento mensal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">3.2%</div>
            <p className="text-xs text-muted-foreground">
              -0.8% desde o mês passado
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Premium</span>
                <span className="text-foreground">2.1%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pro</span>
                <span className="text-foreground">1.8%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
          <CardDescription>
            Últimas assinaturas e pagamentos processados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                user: "João Silva",
                plan: "Premium",
                amount: "R$ 29.90",
                status: "Pago",
                date: "Hoje, 14:30"
              },
              {
                user: "Maria Santos",
                plan: "Pro", 
                amount: "R$ 49.90",
                status: "Pago",
                date: "Hoje, 12:15"
              },
              {
                user: "Pedro Costa",
                plan: "Premium",
                amount: "R$ 29.90",
                status: "Pendente",
                date: "Ontem, 18:45"
              },
              {
                user: "Ana Oliveira",
                plan: "Pro",
                amount: "R$ 49.90",
                status: "Pago",
                date: "Ontem, 16:20"
              }
            ].map((transaction, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{transaction.user}</p>
                    <p className="text-sm text-muted-foreground">Plano {transaction.plan} • {transaction.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">{transaction.amount}</p>
                  <p className={`text-sm ${
                    transaction.status === 'Pago' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {transaction.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Billing;
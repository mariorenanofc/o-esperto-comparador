import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { designColors, fontSpecs, formatDimensions } from "@/data/marketingStrategy";
import { Palette, Type, Ruler, Copy, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  toast({ title: "Copiado!", description: text });
};

export const DesignGuide: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Color Palette */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-5 w-5 text-primary" />
            Paleta de Cores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <h5 className="text-sm font-medium text-muted-foreground mb-3">Cores Principais</h5>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {designColors
              .filter((c) => c.category === "primary")
              .map((color) => (
                <button
                  key={color.hex}
                  className="group rounded-lg overflow-hidden border border-border hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer"
                  onClick={() => copyToClipboard(color.hex)}
                >
                  <div className="h-16" style={{ backgroundColor: color.hex }} />
                  <div className="p-2 bg-card">
                    <p className="text-xs font-medium text-foreground">{color.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{color.hex}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{color.usage}</p>
                  </div>
                </button>
              ))}
          </div>

          <h5 className="text-sm font-medium text-muted-foreground mb-3">Neutros</h5>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {designColors
              .filter((c) => c.category === "neutral")
              .map((color) => (
                <button
                  key={color.hex}
                  className="group rounded-lg overflow-hidden border border-border hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer"
                  onClick={() => copyToClipboard(color.hex)}
                >
                  <div className="h-10" style={{ backgroundColor: color.hex }} />
                  <div className="p-2 bg-card">
                    <p className="text-xs font-medium text-foreground">{color.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{color.hex}</p>
                  </div>
                </button>
              ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">🎨 Clique em uma cor para copiar o código hex</p>
        </CardContent>
      </Card>

      {/* Gradients */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Gradientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { name: "Primário", from: "#4A6FA5", to: "#7C5CFC", usage: "Fundos de destaque" },
              { name: "Sucesso", from: "#48A67D", to: "#4A6FA5", usage: "Posts de economia" },
              { name: "Urgência", from: "#E8A838", to: "#D14545", usage: "Posts de oferta" },
              { name: "Premium", from: "#7C5CFC", to: "#C542A8", usage: "CTAs e destaques" },
            ].map((g) => (
              <div key={g.name} className="rounded-lg overflow-hidden border border-border">
                <div
                  className="h-12"
                  style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
                />
                <div className="p-2 bg-card">
                  <p className="text-xs font-medium text-foreground">{g.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {g.from} → {g.to}
                  </p>
                  <p className="text-xs text-muted-foreground">{g.usage}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Type className="h-5 w-5 text-primary" />
            Tipografia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {fontSpecs.map((spec) => (
              <div key={spec.role} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm font-medium text-foreground">{spec.role}</p>
                  <p className="text-xs text-muted-foreground">{spec.weight}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary">{spec.font}</p>
                  <p className="text-xs text-muted-foreground">Alt: {spec.alternative}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-xs text-foreground font-medium mb-1">📐 Regras de Tipografia</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Máximo 2 fontes por design</li>
              <li>• Máximo 3 tamanhos diferentes por slide</li>
              <li>• Espaçamento entre linhas: 1.3x a 1.5x</li>
              <li>• Alinhamento: esquerda ou centralizado</li>
              <li>• MAIÚSCULAS apenas em títulos curtos e CTAs</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Dimensions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Ruler className="h-5 w-5 text-primary" />
            Dimensões por Formato
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {formatDimensions.map((fmt) => (
              <div key={fmt.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm font-medium text-foreground">{fmt.name}</p>
                  <p className="text-xs text-muted-foreground">{fmt.usage}</p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="font-mono">
                    {fmt.width}x{fmt.height}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{fmt.ratio}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Font Sizes Quick Reference */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tamanhos de Fonte - Referência Rápida</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-medium">Elemento</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Feed</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Stories</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Carrossel</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { el: "Título", feed: "56-64px", stories: "48-56px", carousel: "56-64px" },
                  { el: "Subtítulo", feed: "36-42px", stories: "32-40px", carousel: "42-48px" },
                  { el: "Corpo", feed: "24-28px", stories: "24-32px", carousel: "24-28px" },
                  { el: "Preços", feed: "72-96px", stories: "64-80px", carousel: "64-80px" },
                  { el: "CTA", feed: "28-36px", stories: "28-32px", carousel: "20-24px" },
                ].map((row) => (
                  <tr key={row.el} className="border-b border-border/50">
                    <td className="py-2 font-medium text-foreground">{row.el}</td>
                    <td className="py-2 text-muted-foreground">{row.feed}</td>
                    <td className="py-2 text-muted-foreground">{row.stories}</td>
                    <td className="py-2 text-muted-foreground">{row.carousel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

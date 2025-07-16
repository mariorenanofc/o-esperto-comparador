// src/components/PriceContributionForm.tsx (Depois)
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePriceContributionForm } from "@/hooks/usePriceContributionForm";
import PriceContributionWarning from "./price-contribution/PriceContributionWarning";
// import ProductInfoFields from "./price-contribution/ProductInfoFields"; // Não mais necessário se os campos forem movidos para cá
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input"; // Importar Input
import { Label } from "@/components/ui/label"; // Importar Label
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Importar Select
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"; // Importar componentes de Form

interface PriceContributionFormProps {
  onClose: () => void;
}

const PriceContributionForm: React.FC<PriceContributionFormProps> = ({ onClose }) => {
  console.log('=== RENDERIZANDO PRICE CONTRIBUTION FORM ===');
  console.log('onClose prop:', typeof onClose);

  const {
    form, // O objeto 'form' do react-hook-form
    isSubmitting,
    locationLoading,
    handleSubmit, // O handleSubmit do react-hook-form
  } = usePriceContributionForm({ onClose });

  console.log('=== ESTADO DO FORMULÁRIO (VIA REACT-HOOK-FORM) ===');
  console.log('form.getValues():', form.getValues());
  console.log('form.formState.errors:', form.formState.errors);
  console.log('isSubmitting:', isSubmitting);
  console.log('locationLoading:', locationLoading);
  console.log('handleSubmit (função):', typeof handleSubmit);

  const onButtonClick = () => {
    console.log('=== BOTÃO COMPARTILHAR CLICADO ===');
    console.log('isSubmitting:', isSubmitting);
    console.log('locationLoading:', locationLoading);
    console.log('form.getValues().city:', form.getValues().city);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Compartilhar Preço</CardTitle>
        <CardDescription>
          Ajude nossa comunidade com informações de preços atualizadas
        </CardDescription>
        
        <PriceContributionWarning />
      </CardHeader>
      
      <CardContent>
        {/* Envolva seu formulário com o componente Form do shadcn/ui */}
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo: Nome do Produto */}
            <FormField
              control={form.control}
              name="productName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Produto *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Arroz Tio João 5kg" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Nome da Loja */}
            <FormField
              control={form.control}
              name="storeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Loja *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Supermercado ABC" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campos: Quantidade e Unidade */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade</FormLabel>
                    <FormControl>
                      {/* Use onChange para converter para número antes de passar para field.onChange */}
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a unidade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unidade">Unidade</SelectItem>
                          <SelectItem value="kg">Quilograma</SelectItem>
                          <SelectItem value="g">Grama</SelectItem>
                          <SelectItem value="l">Litro</SelectItem>
                          <SelectItem value="ml">Mililitro</SelectItem>
                          <SelectItem value="pacote">Pacote</SelectItem>
                          <SelectItem value="caixa">Caixa</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Campo: Preço */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço (R$) *</FormLabel>
                  <FormControl>
                    {/* Use onChange para converter para número antes de passar para field.onChange */}
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Cidade (preenchido por Geolocation Hook) */}
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={locationLoading ? "Detectando..." : "Ex: Trindade"}
                      {...field}
                      disabled={isSubmitting || locationLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Estado (preenchido por Geolocation Hook) */}
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={locationLoading ? "..." : "Ex: PE"}
                      maxLength={2}
                      {...field}
                      disabled={isSubmitting || locationLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


            {locationLoading && (
              <div className="text-sm text-blue-600 p-3 bg-blue-50 rounded-lg flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                📍 Detectando sua localização automaticamente...
              </div>
            )}

            {form.getValues().city && form.getValues().state && !locationLoading && (
              <div className="text-sm text-green-600 p-3 bg-green-50 rounded-lg">
                📍 Localização: {form.getValues().city}, {form.getValues().state}
              </div>
            )}

            <div className="flex space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  console.log('Botão Cancelar clicado');
                  onClose();
                }} 
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                onClick={onButtonClick} // Este onClick será executado antes do handleSubmit
                disabled={isSubmitting || locationLoading || !form.getValues().city}
                className="flex-1 bg-app-blue hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Compartilhar"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PriceContributionForm;

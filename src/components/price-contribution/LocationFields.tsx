
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PriceContribution } from "@/lib/types";

interface LocationFieldsProps {
  formData: PriceContribution;
  setFormData: (data: PriceContribution) => void;
  locationLoading: boolean;
}

const LocationFields: React.FC<LocationFieldsProps> = ({ formData, setFormData, locationLoading }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="city">Cidade *</Label>
        <Input
          id="city"
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          placeholder={locationLoading ? "Detectando..." : "Ex: Trindade"}
          required
        />
      </div>
      <div>
        <Label htmlFor="state">Estado *</Label>
        <Input
          id="state"
          value={formData.state}
          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
          placeholder={locationLoading ? "..." : "Ex: PE"}
          required
          maxLength={2}
        />
      </div>
    </div>
  );
};

export default LocationFields;

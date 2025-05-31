
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DuplicateProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  newProductName: string;
  existingProductName: string;
  isExactMatch: boolean;
  onReplace: () => void;
  onKeepBoth: () => void;
}

const DuplicateProductDialog: React.FC<DuplicateProductDialogProps> = ({
  isOpen,
  onClose,
  newProductName,
  existingProductName,
  isExactMatch,
  onReplace,
  onKeepBoth,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isExactMatch ? "Produto já existe" : "Produto similar encontrado"}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            {isExactMatch ? (
              <>
                <p>
                  O produto <strong>"{newProductName}"</strong> já está na sua lista.
                </p>
                <p>
                  Você deseja substituir o produto existente ou escolher um nome diferente?
                </p>
              </>
            ) : (
              <>
                <p>
                  Você está tentando adicionar <strong>"{newProductName}"</strong>, mas já existe um produto similar: <strong>"{existingProductName}"</strong>.
                </p>
                <p>
                  Você deseja:
                </p>
                <ul className="list-disc list-inside ml-4">
                  <li>Atualizar o produto existente "{existingProductName}"</li>
                  <li>Adicionar "{newProductName}" como um produto separado</li>
                </ul>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onReplace}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isExactMatch ? "Substituir" : "Atualizar Existente"}
          </AlertDialogAction>
          {!isExactMatch && (
            <AlertDialogAction
              onClick={onKeepBoth}
              className="bg-green-600 hover:bg-green-700"
            >
              Adicionar Separadamente
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DuplicateProductDialog;

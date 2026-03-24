import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  buttonText?: string;
  onAction?: () => void;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export const ErrorView: React.FC<EmptyStateProps> = ({
  title = 'Algo ha ido mal',
  description = 'No hemos podido cargar este contenido.',
  buttonText = 'Volver atrás',
  onAction = () => window.history.back(),
  icon: Icon = AlertCircle,
}) => {
  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4 sm:px-6">
      <Card className="w-full max-w-lg md:max-w-xl lg:max-w-2xl text-center shadow-xl border border-muted rounded-2xl">
        <CardContent className="flex flex-col items-center gap-6 p-8 sm:p-10 md:p-12">
          <div className="p-4 rounded-full bg-red-100">
            <Icon className="text-red-500 w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-semibold">{title}</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto">
              {description}
            </p>
          </div>

          <Button size="lg" className="mt-2" onClick={onAction}>
            {buttonText}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

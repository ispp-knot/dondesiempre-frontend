'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export default function UnderConstruction() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background to-muted p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <Card className="rounded-2xl shadow-xl border-muted">
          <CardContent className="flex flex-col items-center text-center p-10 space-y-6">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
              <Construction className="w-10 h-10 text-primary" />
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Estamos en construcción
              </h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-md mx-auto">
                Nuestro sitio web está siendo mejorado para ofrecerte una mejor experiencia. Muy
                pronto estaremos de vuelta con novedades increíbles.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

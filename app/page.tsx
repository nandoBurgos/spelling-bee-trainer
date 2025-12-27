import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, Volume2, Upload, Wifi, Shield, Trophy } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <BookOpen className="h-6 w-6 text-primary" />
            <span>SpellMaster</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link href="/register">
              <Button>Registrarse</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
                Domina el <span className="text-primary">Spelling Bee</span> con práctica inteligente
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground text-pretty">
                Practica con miles de palabras de competencia, escucha la pronunciación correcta y mejora tu ortografía
                en inglés.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/register">
                  <Button size="lg" className="text-lg px-8">
                    Comenzar Gratis
                  </Button>
                </Link>
                <Link href="/practice">
                  <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
                    Probar sin cuenta
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Características Principales</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <FeatureCard
                icon={<Volume2 className="h-8 w-8" />}
                title="Pronunciación en Inglés"
                description="Escucha cada palabra pronunciada correctamente con velocidad ajustable."
              />
              <FeatureCard
                icon={<Upload className="h-8 w-8" />}
                title="Listas Personalizadas"
                description="Importa tus propias listas de palabras en formato CSV o Excel."
              />
              <FeatureCard
                icon={<Wifi className="h-8 w-8" />}
                title="Modo Offline"
                description="Practica sin conexión a internet, sincroniza cuando te conectes."
              />
              <FeatureCard
                icon={<Trophy className="h-8 w-8" />}
                title="5,000+ Palabras"
                description="Diccionario completo con palabras de nivel competencia."
              />
              <FeatureCard
                icon={<Shield className="h-8 w-8" />}
                title="Autenticación Biométrica"
                description="Inicia sesión rápidamente con huella dactilar o Face ID."
              />
              <FeatureCard
                icon={<BookOpen className="h-8 w-8" />}
                title="Definiciones y Ejemplos"
                description="Cada palabra incluye su definición y uso en contexto."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl font-bold">¿Listo para mejorar tu spelling?</h2>
              <p className="text-muted-foreground">
                Únete a miles de estudiantes que practican diariamente con SpellMaster.
              </p>
              <Link href="/register">
                <Button size="lg" className="text-lg px-8">
                  Crear Cuenta Gratis
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SpellMaster. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="p-6 rounded-xl bg-card border shadow-sm hover:shadow-md transition-shadow">
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

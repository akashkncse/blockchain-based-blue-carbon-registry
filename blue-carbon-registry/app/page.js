import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <>
      <main className=" mx-auto p-4 md:p-8">
        <div className="grid gap-8 md:grid-cols-2 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              The Transparent Registry for Ocean-Based Carbon Removal
            </h1>
            <p className="text-lg text-muted-foreground">
              We provide an end-to-end platform to transparently finance,
              verify, and retire high-integrity blue carbon credits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="hover:cursor-grab">
                Explore Projects
              </Button>
              <Button
                size="lg"
                className="hover:cursor-grab"
                variant="secondary"
              >
                Register your project
              </Button>
            </div>
          </div>

          <div>
            <Card className="overflow-hidden py-0">
              <CardContent className="p-0 py-0">
                <Image
                  alt="Image"
                  width={800}
                  height={600}
                  src="/hero.jpg"
                  className="w-full h-auto object-cover"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}

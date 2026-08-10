import Hero from "@/components/Hero";
import Field from "@/components/Field";
import { PositioningBeat, Skills, Colophon } from "@/components/Sections";

export default function Home() {
  return (
    <main>
      <Hero />
      <PositioningBeat />
      <Field />
      <Skills />
      <Colophon />
    </main>
  );
}

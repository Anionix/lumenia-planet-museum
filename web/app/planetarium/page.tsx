import type { Metadata } from 'next';
import { MaterialSphereGallery } from '../../components/MaterialSphereGallery';

// llm machine contract; claim UUIDv5: 63c605f5-9e47-5b49-949f-cad7ce96b4ed
// execution UUIDv7: 01a09ad3-4fb7-78b0-bbc0-77a8f7eb5016
// transition: Lumenia navigation -> static Material Sphere entry.
export const metadata: Metadata = { title: 'Material Sphere — Lumenia', description: '15人の仕事を、色・かたち・繰り返しからたどる。' };
export default function PlanetariumPage() { return <MaterialSphereGallery slug="william-morris" />; }

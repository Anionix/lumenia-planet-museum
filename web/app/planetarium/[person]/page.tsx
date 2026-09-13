import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { materialSphereCatalog } from '../../../artwork/material-sphere-catalog';
import { MaterialSphereGallery } from '../../../components/MaterialSphereGallery';

// llm machine contract; claim UUIDv5: 63c605f5-9e47-5b49-949f-cad7ce96b4ed
// execution UUIDv7: 01a09ad3-4fb7-78b0-bbc0-77a8f7eb5016
// transition: known profile -> build-time route; unknown profile -> not found.
export const dynamicParams = false;
export function generateStaticParams() { return materialSphereCatalog.map(person => ({ person: person.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ person: string }> }): Promise<Metadata> {
  const awaitedPerson = (await params).person;
  const profile = materialSphereCatalog.find(person => person.slug === awaitedPerson);
  return { title: `${profile?.name ?? 'Material Sphere'} — Lumenia` };
}
export default async function PersonPage({ params }: { params: Promise<{ person: string }> }) {
  const { person } = await params;
  if (!materialSphereCatalog.some(profile => profile.slug === person)) notFound();
  return <MaterialSphereGallery slug={person} />;
}

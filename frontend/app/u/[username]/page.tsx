"use client";

import { useParams } from "next/navigation";

import { Perfil } from "@/components/Perfil";

export default function PerfilPage() {
  const { username } = useParams<{ username: string }>();
  return <Perfil username={username} />;
}

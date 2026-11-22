"use client";

import { useParams } from "next/navigation";

import { ListaDeConexoes } from "@/components/ListaDeConexoes";

export default function SeguidoresPage() {
  const { username } = useParams<{ username: string }>();
  return <ListaDeConexoes username={username} tipo="seguidores" />;
}

import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ tag: string }>
}

export default async function TagRedirectPage({ params }: Props) {
  const { tag } = await params
  redirect(`/prompts?tag=${encodeURIComponent(tag)}`)
}

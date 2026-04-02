import { redirect } from 'next/navigation'

type PageProps = {
  params: Promise<{ stageId: string }>
}

export default async function LegacyAiStagePage(_props: PageProps) {
  redirect('/learn')
}

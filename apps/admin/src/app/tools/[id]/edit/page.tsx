import NewToolPage from '../../new/page'
export default function EditToolPage({ params }: { params: { id: string } }) {
  return <NewToolPage params={{ id: params.id }} />
}

'use client'
import { Facebook, Share2, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props { url: string; title: string }

export default function ShareButtons({ url, title }: Props) {
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  const waUrl = `https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`
  const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`

  const copyLink = async () => {
    await navigator.clipboard.writeText(url)
    toast.success('লিংক কপি হয়েছে!')
  }

  return (
    <div className="flex items-center gap-3 py-5 border-y border-gray-200 dark:border-gray-800">
      <span className="text-sm text-gray-500 font-medium">শেয়ার করুন:</span>
      <a href={fbUrl} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
      >
        <Facebook className="w-4 h-4" /> Facebook
      </a>
      <a href={waUrl} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors"
      >
        <MessageCircle className="w-4 h-4" /> WhatsApp
      </a>
      <a href={tgUrl} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white text-sm rounded-lg transition-colors"
      >
        Telegram
      </a>
      <button onClick={copyLink}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg transition-colors"
      >
        <Share2 className="w-4 h-4" /> কপি
      </button>
    </div>
  )
}

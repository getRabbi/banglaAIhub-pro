import { createClient } from '@/lib/supabase/server'
import CopyButton from '@/components/ui/CopyButton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI প্রম্পট লাইব্রেরি - BanglaAIHub',
  description: 'ChatGPT, Midjourney সহ সব AI টুলসের জন্য ফ্রি বাংলা prompt collection।',
}
export const revalidate = 3600

export default async function PromptsPage() {
  const supabase = createClient()
  const { data: prompts } = await supabase.from('prompts').select('*').eq('status', 'published').order('use_count', { ascending: false })

  const categories = [...new Set(prompts?.map(p => p.category) || [])]

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI প্রম্পট লাইব্রেরি</h1>
        <p className="text-gray-500 dark:text-gray-400">ChatGPT, Midjourney সহ সব AI-এর জন্য ready-made বাংলা prompts — সম্পূর্ণ ফ্রি</p>
      </div>

      {categories.length > 0 ? (
        <div className="space-y-10">
          {categories.map(cat => {
            const catPrompts = prompts?.filter(p => p.category === cat) || []
            return (
              <div key={cat}>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 capitalize">{cat} Prompts</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {catPrompts.map(prompt => (
                    <div key={prompt.id} className="card-hover p-5 flex flex-col gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{prompt.title}</h3>
                        {prompt.description_bn && <p className="text-sm text-gray-500 line-clamp-2">{prompt.description_bn}</p>}
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300 font-mono line-clamp-3 leading-relaxed">{prompt.prompt_text}</p>
                      </div>
                      <div className="flex gap-2 mt-auto items-center">
                        <CopyButton code={prompt.prompt_text} label="📋 কপি করুন" fullWidth />
                        <span className="text-xs text-gray-400 flex items-center shrink-0">{prompt.use_count} বার ব্যবহৃত</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📝</p>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">প্রম্পট লাইব্রেরি শীঘ্রই আসছে</h2>
          <p className="text-gray-500">নিউজলেটার সাবস্ক্রাইব করুন — আপডেট পাবেন সবার আগে</p>
        </div>
      )}
    </div>
  )
}

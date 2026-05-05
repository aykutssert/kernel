'use client'

import { useState } from 'react'
import { History, FileText, ChevronRight, GitCompare, X, Clock, User } from 'lucide-react'
import * as diff from 'diff'
import { encode } from 'gpt-tokenizer'
import { cn } from '@/lib/utils'
import type { Doc, DocVersion } from '@/types'
import { DocRawContent } from './DocRawContent'

interface Props {
  doc: Doc
  versions: DocVersion[]
  currentHtml: string
  currentLang: string
}

export function DocVersionHandler({ doc, versions, currentHtml, currentLang }: Props) {
  const [activeTab, setActiveTab] = useState<'content' | 'versions'>('content')
  const [selectedVersion, setSelectedVersion] = useState<DocVersion | null>(null)
  const [comparingVersion, setComparingVersion] = useState<DocVersion | null>(null)

  // Current version is not in versions table as a separate snapshot usually until edited
  // But we want to show it in the list.
  
  const handleCompareLatest = () => {
    if (versions.length >= 2) {
      // Compare v1 with current if there's only 2, or compare latest two
      // Actually usually Compare in this context means "Compare Current with Previous"
      setComparingVersion(versions[1] || versions[0])
    } else if (versions.length === 1) {
      setComparingVersion(versions[0])
    }
  }

  const renderDiff = (oldText: string, newText: string) => {
    const changes = diff.diffWordsWithSpace(oldText, newText)
    
    let addedTokens = 0
    let removedTokens = 0
    
    changes.forEach(part => {
      if (part.added) addedTokens += encode(part.value).length
      if (part.removed) removedTokens += encode(part.value).length
    })
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-6 text-[13px] font-mono">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <span>≈+{addedTokens} tokens</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
            <span>≈-{removedTokens} tokens</span>
          </div>
        </div>

        <div className="font-mono text-xs leading-relaxed whitespace-pre-wrap p-5 rounded-md bg-[#F5F5F5] dark:bg-[#262626] border border-border">
          {changes.map((part, index) => (
            <span
              key={index}
              className={cn(
                part.added ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400" : 
                part.removed ? "bg-rose-500/20 text-rose-700 dark:text-rose-400 line-through" : ""
              )}
            >
              {part.value}
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-lg border border-border bg-muted/40 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('content')}
          className={cn(
            "flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all",
            activeTab === 'content' ? "bg-background shadow-sm text-foreground border border-border" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <FileText className="w-4 h-4" />
          Content
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('versions')}
          className={cn(
            "flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all",
            activeTab === 'versions' ? "bg-background shadow-sm text-foreground border border-border" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <History className="w-4 h-4" />
          Versions
          {versions.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-muted text-[10px]">{versions.length}</span>
          )}
        </button>
      </div>

      {activeTab === 'content' ? (
        <DocRawContent 
          html={currentHtml} 
          content={doc.content} 
          variables={doc.variables ?? []} 
          withLines={currentLang !== 'markdown'} 
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Version History</h3>
            <button 
              type="button"
              onClick={handleCompareLatest}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md border border-border hover:bg-muted transition-colors"
              disabled={versions.length === 0}
            >
              <GitCompare className="w-3.5 h-3.5" />
              Compare Latest
            </button>
          </div>

          <div className="divide-y divide-border border rounded-xl overflow-hidden">
            {versions.map((v, i) => (
              <div key={v.id} className="p-4 hover:bg-muted/30 transition-colors group">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">v{v.version_number}</span>
                      {i === 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-semibold">
                          Current Version
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground flex items-center gap-1 ml-2">
                        <Clock className="w-3 h-3" />
                        {new Date(v.created_at).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {v.author_handle || '@admin'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{v.change_summary || 'No description provided'}</p>
                  </div>
                  
                  {i > 0 && (
                    <button 
                      type="button"
                      onClick={() => setComparingVersion(v)}
                      className="p-2 rounded-md hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                      title="Compare with current"
                    >
                      <GitCompare className="w-4 h-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diff Modal */}
      {comparingVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[85vh] bg-background border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <GitCompare className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-bold">
                  v{comparingVersion.version_number} <span className="mx-2 text-muted-foreground">→</span> Current Version
                </h2>
              </div>
              <button 
                type="button"
                onClick={() => setComparingVersion(null)}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 bg-muted/30 border-b flex items-center gap-6 text-xs font-medium">
              <div className="flex items-center gap-1.5 text-foreground/70 italic">
                Changes between v{comparingVersion.version_number} and current version
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {renderDiff(comparingVersion.content, doc.content)}
            </div>
            
            <div className="p-4 border-t bg-muted/10 flex justify-end">
              <button 
                type="button"
                onClick={() => setComparingVersion(null)}
                className="px-6 py-2 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

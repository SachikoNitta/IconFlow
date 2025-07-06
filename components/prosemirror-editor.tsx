"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { EditorState, type Transaction } from "prosemirror-state"
import { EditorView } from "prosemirror-view"
import { Schema } from "prosemirror-model"
import { schema } from "prosemirror-schema-basic"
import { addListNodes } from "prosemirror-schema-list"
import { keymap } from "prosemirror-keymap"
import { history } from "prosemirror-history"
import { baseKeymap } from "prosemirror-commands"
import { toggleMark, setBlockType, chainCommands, exitCode } from "prosemirror-commands"
import { wrapIn, lift } from "prosemirror-commands"
import { wrapInList, splitListItem, liftListItem, sinkListItem } from "prosemirror-schema-list"
import { undo, redo } from "prosemirror-history"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { initialDocumentContent } from "./initial-document"
import {
  Bold,
  Italic,
  Code,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Undo2,
  Redo2,
  Heart,
  Star,
  Smile,
  ThumbsUp,
  Coffee,
  Music,
  Camera,
  Gift,
  Zap,
  Flame,
  Crown,
  Diamond,
} from "lucide-react"

// Icon data type
interface IconData {
  name: string
  label: string
  category: string
  keywords: string[]
  svg: string
}

// Icon components mapping for the UI
const iconComponents: Record<string, React.ComponentType> = {
  heart: Heart,
  star: Star,
  smile: Smile,
  "thumbs-up": ThumbsUp,
  coffee: Coffee,
  music: Music,
  camera: Camera,
  gift: Gift,
  zap: Zap,
  flame: Flame,
  crown: Crown,
  diamond: Diamond,
}

// Custom function to toggle blockquote
const toggleBlockquote = (schema: Schema) => (state: EditorState, dispatch?: (tr: Transaction) => void) => {
  const { $from, $to } = state.selection
  const range = $from.blockRange($to)

  if (!range) return false

  const wrapping = range && range.parent.type === schema.nodes.blockquote

  if (wrapping) {
    // If already in blockquote, lift out of it
    return lift(state, dispatch)
  } else {
    // If not in blockquote, wrap in blockquote
    return wrapIn(schema.nodes.blockquote)(state, dispatch)
  }
}

// Create custom schema with icon node
const iconNode = {
  attrs: { iconName: { default: "heart" } },
  inline: true,
  group: "inline",
  draggable: true,
  toDOM: (node: any) => {
    return [
      "span",
      {
        class: "prosemirror-icon",
        "data-icon": node.attrs.iconName,
        style: "display: inline-block; width: 16px; height: 16px; vertical-align: middle; margin: 0 2px;",
      },
    ]
  },
  parseDOM: [
    {
      tag: "span[data-icon]",
      getAttrs: (dom: any) => ({ iconName: dom.getAttribute("data-icon") }),
    },
  ],
}

// Extend the basic schema with our icon node
const customSchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block").addBefore("image", "icon", iconNode),
  marks: schema.spec.marks,
})

interface ToolbarButtonProps {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  children: React.ReactNode
  title?: string
}

function ToolbarButton({ onClick, active, disabled, children, title }: ToolbarButtonProps) {
  return (
    <Button
      variant={active ? "default" : "ghost"}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="h-8 w-8 p-0"
    >
      {children}
    </Button>
  )
}

export function ProseMirrorEditor() {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const [selectedIcon, setSelectedIcon] = useState<string>("")
  const [editorState, setEditorState] = useState<EditorState | null>(null)
  const [iconData, setIconData] = useState<Record<string, IconData>>({})
  const [availableIcons, setAvailableIcons] = useState<Array<{ name: string; component: React.ComponentType; label: string }>>([])
  const [iconsLoading, setIconsLoading] = useState(true)
  const [showPreview, setShowPreview] = useState(false)
  const [currentJSON, setCurrentJSON] = useState<string>('')
  const [currentHTML, setCurrentHTML] = useState<string>('')

  // Load icons from JSON file
  useEffect(() => {
    const loadIcons = async () => {
      try {
        const response = await fetch('/icons.json')
        if (!response.ok) throw new Error('Failed to load icons')
        
        const data: Record<string, IconData> = await response.json()
        setIconData(data)
        
        // Create availableIcons array for the UI
        const iconsArray = Object.keys(data).map(key => ({
          name: key,
          component: iconComponents[key], // May be undefined for SVG-only icons
          label: data[key].label,
        })) // Include all icons, whether they have components or not
        
        setAvailableIcons(iconsArray)
        setIconsLoading(false)
      } catch (error) {
        console.error('Failed to load icons:', error)
        setIconsLoading(false)
      }
    }
    
    loadIcons()
  }, [])

  const getIconSVG = (iconName: string) => {
    return iconData[iconName]?.svg || iconData["heart"]?.svg || ""
  }

  useEffect(() => {
    if (!editorRef.current || iconsLoading) return

    // Create initial document with demo content
    const initialDoc = customSchema.nodeFromJSON(initialDocumentContent)
    const state = EditorState.create({
      doc: initialDoc,
      schema: customSchema,
      plugins: [
        history(),
        keymap({
          "Mod-z": undo,
          "Mod-y": redo,
          "Mod-Shift-z": redo,
          "Mod-b": toggleMark(customSchema.marks.strong),
          "Mod-i": toggleMark(customSchema.marks.em),
          "Mod-`": toggleMark(customSchema.marks.code),
          "Shift-Ctrl-8": wrapInList(customSchema.nodes.bullet_list),
          "Shift-Ctrl-9": wrapInList(customSchema.nodes.ordered_list),
          Enter: splitListItem(customSchema.nodes.list_item),
          "Mod-[": liftListItem(customSchema.nodes.list_item),
          "Mod-]": sinkListItem(customSchema.nodes.list_item),
          "Mod-Enter": chainCommands(exitCode, (state, dispatch) => {
            if (dispatch)
              dispatch(state.tr.replaceSelectionWith(customSchema.nodes.hard_break.create()).scrollIntoView())
            return true
          }),
          "Shift-Enter": chainCommands(exitCode, (state, dispatch) => {
            if (dispatch)
              dispatch(state.tr.replaceSelectionWith(customSchema.nodes.hard_break.create()).scrollIntoView())
            return true
          }),
          ...baseKeymap,
        }),
      ],
    })

    const view = new EditorView(editorRef.current, {
      state,
      nodeViews: {
        icon: (node, view, getPos) => {
          const dom = document.createElement("span")
          dom.className = "prosemirror-icon-wrapper"
          dom.style.display = "inline-block"
          dom.style.verticalAlign = "middle"
          dom.style.margin = "0 2px"

          const iconName = node.attrs.iconName
          const iconContainer = document.createElement("span")
          iconContainer.innerHTML = getIconSVG(iconName)
          dom.appendChild(iconContainer)

          return { dom }
        },
      },
      dispatchTransaction: (transaction: Transaction) => {
        const newState = view.state.apply(transaction)
        view.updateState(newState)
        setEditorState(newState)
        updatePreviewContent(newState)
      },
    })

    viewRef.current = view
    setEditorState(state)

    return () => {
      view.destroy()
    }
  }, [iconsLoading, iconData])

  const executeCommand = (command: any) => {
    if (!viewRef.current) return false
    return command(viewRef.current.state, viewRef.current.dispatch)
  }

  const isMarkActive = (markType: any) => {
    if (!editorState) return false
    const { from, $from, to, empty } = editorState.selection
    if (empty) return markType.isInSet(editorState.storedMarks || $from.marks())
    return editorState.doc.rangeHasMark(from, to, markType)
  }

  const isBlockActive = (nodeType: any, attrs = {}) => {
    if (!editorState) return false
    const { $from, to, node } = editorState.selection
    if (node) return node.hasMarkup(nodeType, attrs)
    return to <= $from.end() && $from.parent.hasMarkup(nodeType, attrs)
  }

  const insertIcon = (iconName: string) => {
    if (!viewRef.current) return

    const { state, dispatch } = viewRef.current
    const iconNode = customSchema.nodes.icon.create({ iconName })
    const transaction = state.tr.replaceSelectionWith(iconNode)
    dispatch(transaction)
    viewRef.current.focus()
    setSelectedIcon("")
  }

  const clearEditor = () => {
    if (!viewRef.current) return

    const { state, dispatch } = viewRef.current
    const transaction = state.tr.delete(0, state.doc.content.size)
    dispatch(transaction)
    viewRef.current.focus()
  }

  const exportToJSON = () => {
    if (!viewRef.current) return

    const doc = viewRef.current.state.doc
    const json = doc.toJSON()
    
    // Create downloadable file
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'prosemirror-content.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportToHTML = () => {
    if (!viewRef.current) return

    const doc = viewRef.current.state.doc
    const html = serializeHTML(doc)
    
    // Create downloadable file
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'prosemirror-content.html'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const serializeHTML = (doc: any): string => {
    let html = ''
    
    const serializeNode = (node: any): string => {
      if (node.type.name === 'text') {
        let text = node.text
        // Apply marks
        if (node.marks) {
          node.marks.forEach((mark: any) => {
            switch (mark.type.name) {
              case 'strong':
                text = `<strong>${text}</strong>`
                break
              case 'em':
                text = `<em>${text}</em>`
                break
              case 'code':
                text = `<code>${text}</code>`
                break
            }
          })
        }
        return text
      }
      
      if (node.type.name === 'icon') {
        const iconName = node.attrs.iconName
        const iconSvg = iconData[iconName]?.svg || ''
        return `<span class="prosemirror-icon" data-icon="${iconName}">${iconSvg}</span>`
      }
      
      let content = ''
      if (node.content) {
        node.content.content.forEach((child: any) => {
          content += serializeNode(child)
        })
      }
      
      switch (node.type.name) {
        case 'doc':
          return content
        case 'paragraph':
          return `<p>${content}</p>`
        case 'heading':
          const level = node.attrs.level || 1
          return `<h${level}>${content}</h${level}>`
        case 'blockquote':
          return `<blockquote>${content}</blockquote>`
        case 'bullet_list':
          return `<ul>${content}</ul>`
        case 'ordered_list':
          return `<ol>${content}</ol>`
        case 'list_item':
          return `<li>${content}</li>`
        case 'hard_break':
          return '<br>'
        default:
          return content
      }
    }
    
    return serializeNode(doc)
  }

  const getContentAsJSON = () => {
    if (!viewRef.current) return null
    return viewRef.current.state.doc.toJSON()
  }

  const getContentAsHTML = () => {
    if (!viewRef.current) return ''
    return serializeHTML(viewRef.current.state.doc)
  }

  const updatePreviewContent = (state: EditorState) => {
    const json = JSON.stringify(state.doc.toJSON(), null, 2)
    const html = serializeHTML(state.doc)
    setCurrentJSON(json)
    setCurrentHTML(html)
  }

  // Update preview content when editor state changes
  useEffect(() => {
    if (editorState) {
      updatePreviewContent(editorState)
    }
  }, [editorState])

  if (iconsLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading editor...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">IconFlow Editor</h1>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setShowPreview(!showPreview)} 
            variant={showPreview ? "default" : "outline"} 
            size="sm"
          >
            {showPreview ? "Hide Preview" : "Show Preview"}
          </Button>
          <Button onClick={clearEditor} variant="outline" size="sm">
            Clear
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-white">
        {/* Toolbar */}
        <div className="border-b bg-gray-50 p-2">
          <div className="flex items-center gap-1 flex-wrap">
            {/* History */}
            <ToolbarButton onClick={() => executeCommand(undo)} title="Undo (Ctrl+Z)">
              <Undo2 size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={() => executeCommand(redo)} title="Redo (Ctrl+Y)">
              <Redo2 size={16} />
            </ToolbarButton>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Text formatting */}
            <ToolbarButton
              onClick={() => executeCommand(toggleMark(customSchema.marks.strong))}
              active={isMarkActive(customSchema.marks.strong)}
              title="Bold (Ctrl+B)"
            >
              <Bold size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => executeCommand(toggleMark(customSchema.marks.em))}
              active={isMarkActive(customSchema.marks.em)}
              title="Italic (Ctrl+I)"
            >
              <Italic size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => executeCommand(toggleMark(customSchema.marks.code))}
              active={isMarkActive(customSchema.marks.code)}
              title="Code (Ctrl+`)"
            >
              <Code size={16} />
            </ToolbarButton>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Headings */}
            <ToolbarButton
              onClick={() => executeCommand(setBlockType(customSchema.nodes.heading, { level: 1 }))}
              active={isBlockActive(customSchema.nodes.heading, { level: 1 })}
              title="Heading 1"
            >
              <Heading1 size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => executeCommand(setBlockType(customSchema.nodes.heading, { level: 2 }))}
              active={isBlockActive(customSchema.nodes.heading, { level: 2 })}
              title="Heading 2"
            >
              <Heading2 size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => executeCommand(setBlockType(customSchema.nodes.heading, { level: 3 }))}
              active={isBlockActive(customSchema.nodes.heading, { level: 3 })}
              title="Heading 3"
            >
              <Heading3 size={16} />
            </ToolbarButton>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Lists */}
            <ToolbarButton
              onClick={() => executeCommand(wrapInList(customSchema.nodes.bullet_list))}
              active={isBlockActive(customSchema.nodes.bullet_list)}
              title="Bullet List"
            >
              <List size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => executeCommand(wrapInList(customSchema.nodes.ordered_list))}
              active={isBlockActive(customSchema.nodes.ordered_list)}
              title="Numbered List"
            >
              <ListOrdered size={16} />
            </ToolbarButton>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Blockquote */}
            <ToolbarButton
              onClick={() => executeCommand(toggleBlockquote(customSchema))}
              active={isBlockActive(customSchema.nodes.blockquote)}
              title="Blockquote"
            >
              <Quote size={16} />
            </ToolbarButton>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Icon insertion */}
            <div className="flex items-center gap-2">
              <Select value={selectedIcon} onValueChange={setSelectedIcon} disabled={iconsLoading}>
                <SelectTrigger className="w-[140px] h-8">
                  <SelectValue placeholder={iconsLoading ? "Loading..." : "Insert icon"}>
                    {selectedIcon && iconData[selectedIcon] && (
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 flex items-center justify-center"
                          dangerouslySetInnerHTML={{ __html: iconData[selectedIcon].svg }}
                        />
                        <span>{iconData[selectedIcon].label}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {availableIcons.map((icon) => {
                    return (
                      <SelectItem key={icon.name} value={icon.name}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 flex items-center justify-center"
                            dangerouslySetInnerHTML={{ __html: iconData[icon.name]?.svg || '' }}
                          />
                          <span>{icon.label}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              {selectedIcon && !iconsLoading && (
                <Button onClick={() => insertIcon(selectedIcon)} size="sm" className="h-8">
                  Insert
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          className="prose prose-sm max-w-none p-4 min-h-[400px] focus-within:outline-none"
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        />
      </div>

      {/* Real-time Preview Boxes */}
      {showPreview && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* JSON Preview */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 border-b px-4 py-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">JSON Output</h3>
                <Button 
                  onClick={() => navigator.clipboard.writeText(currentJSON)}
                  variant="ghost" 
                  size="sm"
                  className="h-6 px-2 text-xs"
                >
                  Copy
                </Button>
              </div>
            </div>
            <div className="p-4">
              <pre className="text-xs bg-gray-50 p-3 rounded border overflow-auto max-h-64">
                <code>{currentJSON}</code>
              </pre>
            </div>
          </div>

          {/* HTML Preview */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 border-b px-4 py-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">HTML Output</h3>
                <Button 
                  onClick={() => navigator.clipboard.writeText(currentHTML)}
                  variant="ghost" 
                  size="sm"
                  className="h-6 px-2 text-xs"
                >
                  Copy
                </Button>
              </div>
            </div>
            <div className="p-4">
              <pre className="text-xs bg-gray-50 p-3 rounded border overflow-auto max-h-64">
                <code>{currentHTML}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      <div className="text-sm text-muted-foreground">
        <p>
          <strong>Keyboard shortcuts:</strong> Ctrl+B (bold), Ctrl+I (italic), Ctrl+` (code), Ctrl+Shift+8 (bullet
          list), Ctrl+Shift+9 (numbered list), Ctrl+Z (undo), Ctrl+Y (redo)
        </p>
      </div>
    </div>
  )
}

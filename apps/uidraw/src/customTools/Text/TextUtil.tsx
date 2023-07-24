// import * as React from 'react'
// import { observer } from 'mobx-react-lite'
// import {
//   CustomNodeModel,
//   Scene,
//   SelectionHandle,
//   TLBoxShape,
//   TLShapeModel,
//   UiTarget,
// } from '@tldraw/tldraw'
// import { ComponentProps, HTMLContainer, ReactShape } from '@tldraw/react'
// import { Editor as TextEditor, EditorContent, JSONContent } from '@tiptap/react'
// import StarterKit from '@tiptap/starter-kit'
// import { Box2d, SelectionCorner, SelectionEdge, Vec2d } from '@tldraw/tldraw'

// export interface TextShapeModel extends CustomNodeModel {
//   width: number
//   height: number
//   type: 'text'
//   font: 'draw' | 'sans' | 'mono'
//   alignX: 'start' | 'end' | 'center'
//   alignY: 'start' | 'end' | 'center'
//   textDirection: 'ltr' | 'rtl'
//   autosize: true | false
//   scale: number
//   opacity: number
//   json: JSONContent
// }

// export class TextShape extends TLBoxShape<TextShapeModel> implements ReactShape<TextShapeModel> {
//   static id = 'text'

//   canEdit = true

//   canFlip = false

//   padding = 4

//   hideContextBar = () => {
//     return !this.isEditing
//   }

//   static defaultModel = (scene: Scene<any>): TextShapeModel => ({
//     id: 'text',
//     type: 'text',
//     width: 0,
//     height: 0,
//     alignX: 'center',
//     alignY: 'center',
//     textDirection: 'ltr',
//     autosize: true,
//     opacity: 1,
//     scale: 1,
//     fill: { ...scene.getStyle('color').props.fill },
//     stroke: { ...scene.getStyle('color').props.stroke },
//     strokeWidth: scene.getStyle('size').props.strokeWidth,
//     dash: scene.getStyle('dash').props.dash,
//     font: scene.getStyle('font').props.font,
//     json: {
//       type: 'doc',
//       content: [
//         {
//           type: 'paragraph',
//           attrs: { indent: 0 },
//           content: [
//             {
//               type: 'text',
//               text: ' ',
//             },
//           ],
//         },
//       ],
//     },
//   })

//   Component = observer(({ events }: ComponentProps) => {
//     const {
//       isEditing,
//       opacity,
//       model: { font, width, height, autosize, scale, stroke },
//     } = this
//     const { theme } = useTheme()

//     const rEditorWrapper = React.useRef<HTMLDivElement>(null)

//     const rDidReportSize = React.useRef(false)

//     React.useLayoutEffect(() => {
//       const elm = rEditorWrapper.current

//       if (!elm) return

//       elm.style.setProperty('padding', `${this.padding / scale}px`)
//       elm.style.setProperty('transform', `scale(${scale})`)
//     }, [scale])

//     // Set size of editor wrapper
//     React.useLayoutEffect(() => {
//       const { width: prevWidth, height: prevHeight, scale } = this.model

//       const elm = rEditorWrapper.current

//       if (!elm) return

//       // Maybe not needed on every update
//       elm.style.setProperty('height', `${prevHeight / scale}px`)
//       elm.style.setProperty('width', autosize ? `max-content` : `${prevWidth / scale}px`)

//       const size = this.getEditorSize()

//       const update: {
//         width?: number
//         height?: number
//         x?: number
//         y?: number
//       } = {
//         width: size.width,
//         height: size.height,
//       }

//       // If this shape doesn't yet have a size...
//       if (!rDidReportSize.current) {
//         // But now has a size...
//         if (size.width !== 0 && size.height !== 0) {
//           rDidReportSize.current = true
//           // And it didn't have a size before...
//           if (width === 0 && height === 0) {
//             update.x = this.model.x - size.width / 2
//             update.y = this.model.y - size.height / 2
//           }
//         }
//       }

//       if (Math.abs(prevWidth - update.width!) < 0.01) delete update.width
//       if (Math.abs(prevHeight - update.height!) < 0.01) delete update.height

//       if (update.height !== undefined || update.width !== undefined) {
//         this.scene.dispatch({
//           type: UiTarget.Update,
//           shape: this,
//           name: 'update_shape',
//           update,
//         })
//       }
//     }, [width, height, autosize, scale])

//     // Set style properties
//     const rPrevFont = React.useRef(font)

//     React.useLayoutEffect(() => {
//       const elm = rEditorWrapper.current

//       if (!elm) return

//       elm.classList.remove(`tl-text--font-${rPrevFont.current}`)
//       elm.classList.add(`tl-text--font-${font}`)

//       rPrevFont.current = font
//     }, [font])

//     React.useLayoutEffect(() => {
//       const elm = rEditorWrapper.current
//       if (!elm) return

//       elm.style.color = stroke[theme]
//     }, [theme, stroke])

//     // Focus the editor when the shape begins editing
//     React.useLayoutEffect(() => {
//       if (isEditing) {
//         this.editor.setEditable(true)
//         this.editor.chain().focus().selectAll().run()

//         const { isMobile, viewport } = this.scene
//         if (isMobile) {
//           viewport.centerOnBounds(this.pageBounds, 0, -128)
//         }
//       } else {
//         this.editor.setEditable(false)
//       }
//     }, [isEditing])

//     // Prevent events from propagating to the document
//     const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
//       if (this.isEditing) {
//         switch (e.key) {
//           case 'Tab': {
//             e.preventDefault()
//             break
//           }
//         }

//         e.stopPropagation()
//       }
//     }, [])

//     const handleInnerPointerDown = React.useCallback((e: React.PointerEvent) => {
//       if (this.isEditing) {
//         e.stopPropagation()
//       }
//     }, [])

//     return (
//       <HTMLContainer {...events} opacity={opacity}>
//         <div
//           className="tl-text--wrapper"
//           ref={rEditorWrapper}
//           onKeyDown={handleKeyDown}
//           data-isediting={isEditing}
//         >
//           <EditorContent editor={this.editor} onPointerDown={handleInnerPointerDown} />
//         </div>
//       </HTMLContainer>
//     )
//   })

//   Indicator = observer(() => {
//     const {
//       isSelected,
//       model: { autosize, width, height },
//     } = this

//     return (
//       <>
//         <rect width={width} height={height} />
//         {isSelected && (
//           <g>
//             <path
//               transform={`translate(${width + 8},${height / 2})`}
//               d={autosize ? 'M 0,-4 4,0 0,4' : 'M 0,-4 0,4'}
//             />
//           </g>
//         )}
//       </>
//     )
//   })

//   onChange = <T extends TextShapeModel, K extends keyof T>(model: T, prop: K, value: T[K]) => {
//     if (prop === 'json') {
//       if (JSON.stringify(value) === JSON.stringify(this.editor.getJSON())) {
//         return
//       }

//       // We need to update the editor!
//       this.editor.commands.setContent(value)
//       this.handleUpdate()
//     }
//   }

//   onEditingEnd = () => {
//     const text = this.editor.getText().trim()
//     if (!text.length) {
//       this.scene.removeNode(this.id)
//     }
//   }

//   onResizeStart = (info: { handle: SelectionHandle }) => {
//     if (this.scene.selected.only !== this) return

//     switch (info.handle) {
//       case SelectionCorner.TopLeft:
//       case SelectionCorner.TopRight:
//       case SelectionCorner.BottomRight:
//       case SelectionCorner.BottomLeft:
//       case SelectionEdge.Top:
//       case SelectionEdge.Bottom: {
//         // We're going to be scaling the shape
//         return
//       }
//       default: {
//         // We're adjusting the shape's width
//         return {
//           alignX: 'start',
//           alignY: 'start',
//           autosize: false,
//         }
//       }
//     }
//   }

//   onResize = (info: {
//     handle: SelectionHandle
//     initialModel: TLShapeModel<TextShapeModel>
//     initialBounds: Box2d
//     scaleX: number
//     scaleY: number
//     bounds: Box2d
//     isSingle: boolean
//   }) => {
//     if (!info.isSingle) {
//       return {
//         x: info.bounds.minX,
//         y: info.bounds.minY,
//         width: Math.max(10, info.bounds.width),
//         height: Math.max(10, info.bounds.height),
//         scale: Math.abs(info.initialModel.scale * Math.max(info.scaleX, info.scaleY)),
//       }
//     }

//     const {
//       initialModel: {
//         scale: initialScale,
//         x: initialX,
//         y: initialY,
//         width: initialWidth,
//         height: initialHeight,
//       },
//       scaleX,
//       scaleY,
//       bounds: { width, height, minX, minY },
//     } = info

//     let scale: number

//     switch (info.handle) {
//       case SelectionCorner.TopRight:
//       case SelectionCorner.BottomLeft:
//       case SelectionCorner.BottomRight:
//       case SelectionCorner.TopLeft: {
//         scale = Math.max(Math.abs(scaleY), Math.abs(scaleX))
//         break
//       }
//       case SelectionEdge.Top:
//       case SelectionEdge.Bottom: {
//         scale = Math.abs(scaleY)
//         break
//       }
//       default: {
//         scale = Math.abs(scaleX)
//       }
//     }

//     const nextWidth = Math.ceil(initialWidth * scale)
//     const nextHeight = Math.ceil(initialHeight * scale)

//     const delta = new Vec2d()

//     switch (info.handle) {
//       case SelectionCorner.TopLeft: {
//         delta.x = scaleX < 0 ? initialWidth : initialWidth - nextWidth
//         delta.y = scaleY < 0 ? initialHeight : initialHeight - nextHeight
//         break
//       }
//       case SelectionCorner.TopRight: {
//         delta.x = scaleX < 0 ? -nextWidth : 0
//         delta.y = scaleY < 0 ? initialHeight : initialHeight - nextHeight
//         break
//       }
//       case SelectionCorner.BottomLeft: {
//         delta.x = scaleX < 0 ? initialWidth : initialWidth - nextWidth
//         delta.y = scaleY < 0 ? -nextHeight : 0
//         break
//       }
//       case SelectionCorner.BottomRight: {
//         delta.x = scaleX < 0 ? -nextWidth : 0
//         delta.y = scaleY < 0 ? -nextHeight : 0
//         break
//       }
//       case SelectionEdge.Bottom: {
//         delta.x = initialWidth / 2 - nextWidth / 2
//         delta.y = scaleY < 0 ? -nextHeight : 0
//         break
//       }
//       case SelectionEdge.Top: {
//         delta.x = initialWidth / 2 - nextWidth / 2
//         delta.y = scaleY < 0 ? initialHeight : initialHeight - nextHeight
//         break
//       }
//       default: {
//         // left and right
//         return {
//           x: minX,
//           y: minY,
//           width,
//           height,
//         }
//       }
//     }

//     // Rotate the delta by this shape's rotation
//     delta.rot(this.rotation)

//     return {
//       x: initialX + delta.x,
//       y: initialY + delta.y,
//       width: Math.max(10, nextWidth),
//       height: Math.max(10, nextHeight),
//       scale: initialScale * scale,
//     }
//   }

//   onDoubleClickSelectionHandle = (handle: SelectionHandle) => {
//     switch (handle) {
//       case SelectionEdge.Top:
//       case SelectionEdge.Bottom:
//       case SelectionCorner.TopLeft:
//       case SelectionCorner.TopRight:
//       case SelectionCorner.BottomRight:
//       case SelectionCorner.BottomLeft: {
//         const { width, scale } = this.model
//         return {
//           scale: 1,
//           width: width / scale,
//         }
//       }
//       case SelectionEdge.Left:
//       case SelectionEdge.Right: {
//         if (this.model.autosize) {
//           return {
//             autosize: false,
//             alignX: 'start',
//             alignY: 'start',
//           }
//         } else {
//           return {
//             autosize: true,
//             alignX: 'center',
//             alignY: 'center',
//           }
//         }
//       }
//     }

//     return
//   }

//   private getEditorSize = () => {
//     const elm = this.editor.view.dom as HTMLDivElement

//     if (!elm) return { width: 100, height: 100 } // for testing?

//     return {
//       width: elm.scrollWidth * this.model.scale + this.padding * 2,
//       height: elm.scrollHeight * this.model.scale + this.padding * 2,
//     }
//   }

//   private handleUpdate = () => {
//     const { editor } = this

//     const { alignX, alignY } = this.model

//     const json = editor.getJSON()

//     const { width: nextWidth, height: nextHeight } = this.getEditorSize()

//     const { x, y, width: prevWidth, height: prevHeight } = this.model

//     const update: Partial<TextShapeModel> = {
//       x,
//       y,
//       json,
//       width: nextWidth,
//       height: nextHeight,
//     }

//     switch (alignX) {
//       case 'center': {
//         const delta = Vec2d.Rot({ x: -((nextWidth - prevWidth) / 2), y: 0 }, this.rotation)
//         update.x = x + delta.x
//         update.y = y + delta.y
//         break
//       }
//       case 'end': {
//         const delta = Vec2d.Rot({ x: -(nextWidth - prevWidth), y: 0 }, this.rotation)
//         update.x = x + delta.x
//         update.y = y + delta.y
//         break
//       }
//     }

//     switch (alignY) {
//       case 'center': {
//         const delta = Vec2d.Rot({ x: 0, y: -((nextHeight - prevHeight) / 2) }, this.rotation)
//         update.x = x + delta.x
//         update.y = y + delta.y
//         break
//       }
//       case 'end': {
//         const delta = Vec2d.Rot({ x: 0, y: -(nextHeight - prevHeight) }, this.rotation)
//         update.x = x + delta.x
//         update.y = y + delta.y
//         break
//       }
//     }

//     // Uhh.... we'll come back to this.

//     if (update.x === this.model.x) delete update.x
//     if (update.y === this.model.y) delete update.y
//     if (update.width === this.model.width) delete update.width
//     if (update.height === this.model.height) delete update.height
//     if (JSON.stringify(update.json) === JSON.stringify(this.model.json)) delete update.json

//     this.scene.dispatch({
//       type: UiTarget.Update,
//       shape: this,
//       name: 'update_shape',
//       update,
//     })

//     return
//   }

//   editor = new TextEditor({
//     extensions: [StarterKit, Indent],
//     content: this.model.json,
//     editorProps: {
//       attributes: {
//         class: 'tl-tiptap-editor',
//         tabindex: '-1',
//         draggable: 'false',
//       },
//     },
//     editable: false,
//     onCreate: this.handleUpdate,
//     onUpdate: this.handleUpdate,
//   })

//   dispose = () => {
//     this.editor.destroy()
//   }

//   forceUpdate = () => {
//     this.handleUpdate()
//   }
// }

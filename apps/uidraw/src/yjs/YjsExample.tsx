import { Tldraw, track, useEditor } from '@tldraw/tldraw'
import '@tldraw/tldraw/tldraw.css'
import { useParams } from 'react-router-dom'
import { useYjsStore } from './useYjsStore'

const HOST_URL =
	process.env.NODE_ENV === 'development' ? 'ws://localhost:1234' : 'wss://y-websocket.xn--lkv.com'

export default function YjsExample() {
	const params = useParams()
	const store = useYjsStore({
		roomId: params.roomId,
		hostUrl: HOST_URL,
	})

	return (
		<div className="tldraw__editor">
			<Tldraw
				autoFocus
				store={store}
				shareZone={<NameEditor />}
				shapeUtils={[]}
				renderDebugMenuItems={() => <div></div>}
			/>
		</div>
	)
}

const NameEditor = track(() => {
	const editor = useEditor()

	const { color, name } = editor.user

	return (
		<div style={{ pointerEvents: 'all', display: 'flex' }}>
			{/* <input
				type="color"
				value={color}
				onChange={(e) => {
					editor.user.updateUserPreferences({
						color: e.currentTarget.value,
					})
				}}
			/>
			<input
				defaultValue={name}
				onChange={(e) => {
					editor.user.updateUserPreferences({
						name: e.currentTarget.value,
					})
				}}
			/> */}
		</div>
	)
})

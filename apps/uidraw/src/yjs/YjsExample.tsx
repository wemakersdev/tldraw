import { Tldraw, track, useEditor } from '@tldraw/tldraw'
import '@tldraw/tldraw/tldraw.css'
import { useParams } from 'react-router-dom'
import { CardShapeTool } from '../customTools/CardShape/CardShapeTool'
import { CardShapeUtil } from '../customTools/CardShape/CardShapeUtil'
import { uiOverrides } from '../customTools/ui-overrides'
import { useYjsStore } from './useYjsStore'

const HOST_URL =
	process.env.NODE_ENV === 'development' ? 'ws://localhost:1234' : 'wss://y-websocket.xn--lkv.com'

const customTools = [CardShapeTool]

const customShapeUtils = [CardShapeUtil]

export default function YjsExample() {
	const params = useParams()
	const store = useYjsStore({
		roomId: params.roomId,
		hostUrl: HOST_URL,
		shapeUtils: customShapeUtils,
	})

	return (
		<div className="tldraw__editor">
			<Tldraw
				store={store}
				shareZone={<Header />}
				shapeUtils={customShapeUtils}
				tools={customTools}
				overrides={uiOverrides}
			/>
		</div>
	)
}

const Header = track(() => {
	const editor = useEditor()

	const { color, name } = editor.user

	const store = editor.store

	const records = store.query.records('instance_presence')

	const followingUserId = editor.instanceState.followingUserId

	return (
		<div
			style={{ pointerEvents: 'all', display: 'flex' }}
			onPointerDown={(e) => {
				e.stopPropagation()
			}}
			onClick={(e) => {
				e.stopPropagation()
			}}
		>
			<select
				value={followingUserId || ''}
				onChange={(e) => {
					const value = e.currentTarget.value
					if (value) {
						editor.startFollowingUser(value)
					} else {
						editor.stopFollowingUser()
					}
				}}
				style={{
					color: 'white',
					border: '1px solid #666',
					padding: '4px 10px',
					borderRadius: '10px',
					background: '#353d44',
					marginRight: '5px',
				}}
			>
				<option value="">Follow User</option>
				{records.value.map((record) => {
					return (
						<option key={record.userId} value={record.userId}>
							{record.userName || record.userId}
						</option>
					)
				})}
			</select>
			<input
				style={{
					color: 'white',
					border: '1px solid #666',
					padding: '2px 4px',
					borderRadius: '10px',
					background: '#353d44',
					marginRight: '5px',
				}}
				type="color"
				value={color}
				onChange={(e) => {
					editor.user.updateUserPreferences({
						color: e.currentTarget.value,
					})
				}}
			/>
			<input
				style={{
					color: 'white',
					border: '1px solid #666',
					padding: '4px 10px',
					borderRadius: '10px',
					background: '#353d44',
				}}
				defaultValue={name}
				onChange={(e) => {
					editor.user.updateUserPreferences({
						name: e.currentTarget.value,
					})
				}}
			/>
		</div>
	)
})

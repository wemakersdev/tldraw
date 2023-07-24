import {
	Box2d,
	HTMLContainer,
	ShapeUtil,
	TLOnClickHandler,
	TLOnResizeHandler,
	getDefaultColorTheme,
	resizeBox,
} from '@tldraw/tldraw'
import { useState } from 'react'
import { cardShapeMigrations } from './card-shape-migrations'
import { cardShapeProps } from './card-shape-props'
import { ICardShape } from './card-shape-types'

// A utility class for the card shape. This is where you define
// the shape's behavior, how it renders (its component and
// indicator), and how it handles different events.

export class CardShapeUtil extends ShapeUtil<ICardShape> {
	static override type = 'card' as const
	// A validation schema for the shape's props (optional)
	static override props = cardShapeProps
	// Migrations for upgrading shapes (optional)
	static override migrations = cardShapeMigrations

	// Flags
	override isAspectRatioLocked = (_shape: ICardShape) => false
	override canResize = (_shape: ICardShape) => true
	override canBind = (_shape: ICardShape) => true

	public setCollapsed: (isCollapsed: boolean) => void = () => {
		return
	}

	getDefaultProps(): ICardShape['props'] {
		return {
			w: 300,
			h: 300,
			color: 'black',
			weight: 'regular',
			meta: {
				isCollapsed: false,
			},
		}
	}

	getBounds(shape: ICardShape) {
		return new Box2d(0, 0, shape.props.w, shape.props.h)
	}

	// Render method — the React component that will be rendered for the shape
	component(shape: ICardShape) {
		const theme = getDefaultColorTheme({ isDarkMode: this.editor.user.isDarkMode })

		// eslint-disable-next-line react-hooks/rules-of-hooks
		const [isCollapsed, setCollapsed] = useState(shape.props.meta.isCollapsed)
		this.setCollapsed = setCollapsed

		// Unfortunately eslint will think this is a class components
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const [value, setValue] = useState(shape.props.meta.content || '')

		if (!isCollapsed) {
			return (
				<HTMLContainer
					id={shape.id}
					style={{
						border: '1px solid #ddd',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						pointerEvents: 'all',
						backgroundColor: theme[shape.props.color].semi,
						fontWeight: shape.props.weight,
						color: theme[shape.props.color].solid,
					}}
				>
					<textarea
						onClick={(e) => {
							e.stopPropagation()
							e.preventDefault()
						}}
						style={{
							backgroundColor: theme[shape.props.color].semi,
							fontWeight: shape.props.weight,
							color: theme[shape.props.color].solid,
							border: 'none',
							resize: 'none',
							height: '100%',
							width: '100%',
						}}
						placeholder="Enter text here"
						value={value}
						onChange={(e) => {
							setValue(e.currentTarget.value)
						}}
					/>
				</HTMLContainer>
			)
		} else {
			return (
				<HTMLContainer
					id={shape.id}
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						pointerEvents: 'all',
						borderRadius: '50%',
					}}
				>
					<div
						style={{
							height: '15px',
							width: '15px',
							borderRadius: '50%',
							color: 'lightblue',
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							style={{
								height: '100%',
								width: '100%',
							}}
							viewBox="0 0 24 24"
						>
							<g fill="none">
								<path
									fill="currentColor"
									d="M12 21a9 9 0 1 0-9-9c0 1.488.36 2.89 1 4.127L3 21l4.873-1c1.236.639 2.64 1 4.127 1Z"
									opacity="50"
								/>
								<path
									stroke="currentColor"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 21a9 9 0 1 0-9-9c0 1.488.36 2.89 1 4.127L3 21l4.873-1c1.236.639 2.64 1 4.127 1Z"
								/>
							</g>
						</svg>
					</div>
				</HTMLContainer>
			)
		}
	}

	// Indicator — used when hovering over a shape or when it's selected; must return only SVG elements here
	indicator(shape: ICardShape) {
		return <rect width={shape.props.w} height={shape.props.h} />
	}

	// Events
	override onResize: TLOnResizeHandler<ICardShape> = (shape, info) => {
		return resizeBox(shape, info)
	}

	override onDoubleClick?: TLOnClickHandler<ICardShape> = (shape) => {
		const isCollapsed = shape.props.meta.isCollapsed

		if (isCollapsed) {
			this.setCollapsed(false)
			return {
				id: shape.id,
				type: 'card',

				x: shape.x,
				y: shape.y,

				props: {
					w: shape.props.meta.lastW ? shape.props.meta.lastW : (300 as any),
					h: shape.props.meta.lastH ? shape.props.meta.lastH : (300 as any),
					meta: {
						isCollapsed: false,
					},
				},
			}
		} else {
			this.setCollapsed(true)
			const bounds = this.editor.getBounds(shape)
			return {
				id: shape.id,
				type: 'card',

				x: shape.x,
				y: shape.y,
				props: {
					w: 15,
					h: 15,
					meta: {
						isCollapsed: true,
						lastW: bounds.w,
						lastH: bounds.h,
					},
				},
			}
		}
	}
}

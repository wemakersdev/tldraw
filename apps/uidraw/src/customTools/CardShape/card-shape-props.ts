import { DefaultColorStyle, ShapeProps, StyleProp, T } from '@tldraw/tldraw'
import { ICardShape } from './card-shape-types'

export const WeightStyle = StyleProp.defineEnum('myApp:weight', {
	defaultValue: 'regular',
	values: ['regular', 'bold'],
})

// Validation for our custom card shape's props, using our custom style + one of tldraw's default styles
export const cardShapeProps: ShapeProps<ICardShape> = {
	w: T.number,
	h: T.number,
	color: DefaultColorStyle,
	weight: WeightStyle,
	meta: T.object({
		isCollapsed: T.boolean,
		lastH: T.number.optional(),
		lastW: T.number.optional(),
		content: T.string.optional(),
	}),
}

import {
	Editor,
	GeoShapeGeoStyle,
	TLGeoShape,
	TLTextShape,
	createShapeId,
	preventDefault,
	track,
	useEditor,
	useValue,
} from '@tldraw/editor'
import classNames from 'classnames'
import React, { memo } from 'react'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import { useReadonly } from '../../hooks/useReadonly'
import { TLUiToolbarItem, useToolbarSchema } from '../../hooks/useToolbarSchema'
import { TLUiToolItem } from '../../hooks/useTools'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import { DuplicateButton } from '../DuplicateButton'
import { RedoButton } from '../RedoButton'
import { TrashButton } from '../TrashButton'
import { UndoButton } from '../UndoButton'
import { Button } from '../primitives/Button'
import * as M from '../primitives/DropdownMenu'
import { kbdStr } from '../primitives/shared'
import { ToggleToolLockedButton } from './ToggleToolLockedButton'

type ViewPort = 'mobile' | 'tablet' | 'desktop'

interface ViewportDimensions {
	height: number
	width: number
}

const handleAddViewport = (editor: Editor, viewport: ViewPort): void => {
	const id = createShapeId(viewport)
	editor.focus()

	const dimensions: Record<ViewPort, ViewportDimensions> = {
		mobile: { height: 667, width: 375 },
		tablet: { height: 1024, width: 768 },
		desktop: { height: 720, width: 1280 },
	}

	// Create a rectangle shape for the viewport
	const xPosition = 128 + Math.random() * 500
	const yPosition = 128 + Math.random() * 500

	editor.createShapes<TLGeoShape>([
		{
			id,
			type: 'geo',
			x: xPosition,
			y: yPosition,
			props: {
				geo: 'rectangle',
				w: dimensions[viewport].width,
				h: dimensions[viewport].height,
				dash: 'draw',
				color: 'black',
				size: 'm',
			},
		},
	])

	// Create a text shape for the title
	const titleId = createShapeId(viewport + 'title')
	editor.createShapes<TLTextShape>([
		{
			id: titleId,
			type: 'text',
			x: xPosition, // positioned in the center of the viewport
			y: yPosition - 40, // positioned slightly above the viewport rectangle

			props: {
				text: viewport,
				color: 'black',
				size: 'm',
				align: 'middle',
				w: dimensions[viewport].width,
			},
		},
	])

	editor.groupShapes([id, titleId])

	// Zoom the camera to fit the shape
	editor.zoomToFit()
}

/** @public */
export const Toolbar = memo(function Toolbar() {
	const editor = useEditor()
	const msg = useTranslation()
	const breakpoint = useBreakpoint()

	const rMostRecentlyActiveDropdownItem = React.useRef<TLUiToolbarItem | undefined>(undefined)

	const isReadonly = useReadonly()
	const toolbarItems = useToolbarSchema()
	const laserTool = toolbarItems.find((item) => item.toolItem.id === 'laser')

	const activeToolId = useValue('current tool id', () => editor.currentToolId, [editor])

	const isHandTool = activeToolId === 'hand'
	const geoState = useValue('geo', () => editor.sharedStyles.getAsKnownValue(GeoShapeGeoStyle), [
		editor,
	])

	const showEditingTools = !isReadonly
	const showExtraActions = !(isReadonly || isHandTool)

	const getTitle = (item: TLUiToolItem) =>
		item.label ? `${msg(item.label)} ${item.kbd ? kbdStr(item.kbd) : ''}` : ''

	const activeTLUiToolbarItem = toolbarItems.find((item) => {
		return isActiveTLUiToolItem(item.toolItem, activeToolId, geoState)
	})

	const { itemsInPanel, itemsInDropdown, dropdownFirstItem } = React.useMemo(() => {
		const itemsInPanel: TLUiToolbarItem[] = []
		const itemsInDropdown: TLUiToolbarItem[] = []
		let dropdownFirstItem: TLUiToolbarItem | undefined

		const overflowIndex = Math.min(8, 5 + breakpoint)

		for (let i = 4; i < toolbarItems.length; i++) {
			const item = toolbarItems[i]
			if (i < overflowIndex) {
				// Items below the overflow index will always be in the panel
				itemsInPanel.push(item)
			} else {
				// Items above will be in the dropdown menu unless the item
				// is active (or was the most recently selected active item)
				if (item === activeTLUiToolbarItem) {
					// If the dropdown item is active, make it the dropdownFirstItem
					dropdownFirstItem = item
				}
				// Otherwise, add it to the items in dropdown menu
				itemsInDropdown.push(item)
			}
		}

		if (dropdownFirstItem) {
			// noop
		} else {
			// If we don't have a currently active dropdown item, use the most
			// recently active dropdown item as the current dropdown first item.

			// If haven't ever had a most recently active dropdown item, then
			// make the first item in the dropdown menu the most recently
			// active dropdown item.
			if (!rMostRecentlyActiveDropdownItem.current) {
				rMostRecentlyActiveDropdownItem.current = itemsInDropdown[0]
			}

			dropdownFirstItem = rMostRecentlyActiveDropdownItem.current

			// If the most recently active dropdown item is no longer in the
			// dropdown (because the breakpoint has changed) then make the
			// first item in the dropdown menu the most recently active
			// dropdown item.
			if (!itemsInDropdown.includes(dropdownFirstItem)) {
				dropdownFirstItem = itemsInDropdown[0]
			}
		}

		// We want this ref set to remember which item from the current
		// set of dropdown items was most recently active
		rMostRecentlyActiveDropdownItem.current = dropdownFirstItem

		if (itemsInDropdown.length <= 2) {
			itemsInPanel.push(...itemsInDropdown)
			itemsInDropdown.length = 0
		}

		return { itemsInPanel, itemsInDropdown, dropdownFirstItem }
	}, [toolbarItems, activeTLUiToolbarItem, breakpoint])

	return (
		<div className="tlui-toolbar">
			<div className="tlui-toolbar__inner">
				<div className="tlui-toolbar__left">
					{!isReadonly && (
						<div
							className={classNames('tlui-toolbar__extras', {
								'tlui-toolbar__extras__hidden': !showExtraActions,
							})}
						>
							{breakpoint < 6 && (
								<div className="tlui-toolbar__extras__controls">
									<UndoButton />
									<RedoButton />
									<TrashButton />
									<DuplicateButton />
									{/* <ActionsMenu /> */}
								</div>
							)}
							<ToggleToolLockedButton activeToolId={activeToolId} />
						</div>
					)}
					<div
						className={classNames('tlui-toolbar__tools', {
							'tlui-toolbar__tools__mobile': breakpoint < 5,
						})}
					>
						{/* Select / Hand */}
						{toolbarItems.slice(0, 2).map(({ toolItem }) => {
							return (
								<ToolbarButton
									key={toolItem.id}
									item={toolItem}
									title={getTitle(toolItem)}
									isSelected={isActiveTLUiToolItem(toolItem, activeToolId, geoState)}
								/>
							)
						})}
						{isReadonly && laserTool && (
							<ToolbarButton
								key={laserTool.toolItem.id}
								item={laserTool.toolItem}
								title={getTitle(laserTool.toolItem)}
								isSelected={isActiveTLUiToolItem(laserTool.toolItem, activeToolId, geoState)}
							/>
						)}
						{showEditingTools && (
							<>
								{/* Draw / Eraser */}
								<div className="tlui-toolbar__divider" />
								{toolbarItems.slice(2, 4).map(({ toolItem }) => (
									<ToolbarButton
										key={toolItem.id}
										item={toolItem}
										title={getTitle(toolItem)}
										isSelected={isActiveTLUiToolItem(toolItem, activeToolId, geoState)}
									/>
								))}
								{/* Everything Else */}
								<div className="tlui-toolbar__divider" />
								<Button
									className="tlui-toolbar__tools__button"
									onClick={() => {
										handleAddViewport(editor, 'mobile')
									}}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="15"
										height="15"
										viewBox="0 0 15 15"
									>
										<path
											fill="currentColor"
											fill-rule="evenodd"
											d="M4 2.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5v10a.5.5 0 0 1-.5.5h-6a.5.5 0 0 1-.5-.5v-10ZM4.5 1A1.5 1.5 0 0 0 3 2.5v10A1.5 1.5 0 0 0 4.5 14h6a1.5 1.5 0 0 0 1.5-1.5v-10A1.5 1.5 0 0 0 10.5 1h-6ZM6 11.65a.35.35 0 1 0 0 .7h3a.35.35 0 1 0 0-.7H6Z"
											clip-rule="evenodd"
										/>
									</svg>
								</Button>

								<Button
									className="tlui-toolbar__tools__button"
									onClick={() => {
										handleAddViewport(editor, 'tablet')
									}}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="24"
										viewBox="0 0 24 24"
									>
										<path
											fill="currentColor"
											d="M19.749 4a2.25 2.25 0 0 1 2.25 2.25v11.502a2.25 2.25 0 0 1-2.25 2.25H4.25A2.25 2.25 0 0 1 2 17.752V6.25A2.25 2.25 0 0 1 4.25 4h15.499Zm0 1.5H4.25a.75.75 0 0 0-.75.75v11.502c0 .415.336.75.75.75h15.499a.75.75 0 0 0 .75-.75V6.25a.75.75 0 0 0-.75-.75Zm-9.499 10h3.5a.75.75 0 0 1 .102 1.494L13.75 17h-3.5a.75.75 0 0 1-.102-1.493l.102-.007h3.5h-3.5Z"
										/>
									</svg>
								</Button>

								<Button
									className="tlui-toolbar__tools__button"
									onClick={() => {
										handleAddViewport(editor, 'desktop')
									}}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="15"
										height="15"
										viewBox="0 0 15 15"
									>
										<path
											fill="currentColor"
											fill-rule="evenodd"
											d="M2 4.25A.25.25 0 0 1 2.25 4h10.5a.25.25 0 0 1 .25.25v7.25H2V4.25ZM2.25 3C1.56 3 1 3.56 1 4.25V12H0v.5a.5.5 0 0 0 .5.5h14a.5.5 0 0 0 .5-.5V12h-1V4.25C14 3.56 13.44 3 12.75 3H2.25Z"
											clip-rule="evenodd"
										/>
									</svg>
								</Button>
								{/* {itemsInPanel.map(({ toolItem }) => (
									<ToolbarButton
										key={toolItem.id}
										item={toolItem}
										title={getTitle(toolItem)}
										isSelected={isActiveTLUiToolItem(toolItem, activeToolId, geoState)}
									/>
								))} */}
								{/* Overflowing Shapes */}
								{itemsInDropdown.length ? (
									<>
										{/* Last selected (or first) item from the overflow */}
										{/* <ToolbarButton
											key={dropdownFirstItem.toolItem.id}
											item={dropdownFirstItem.toolItem}
											title={getTitle(dropdownFirstItem.toolItem)}
											isSelected={isActiveTLUiToolItem(
												dropdownFirstItem.toolItem,
												activeToolId,
												geoState
											)}
										/> */}
										{/* The dropdown to select everything else */}
										<M.Root id="toolbar overflow" modal={false}>
											<M.Trigger>
												<Button
													className="tlui-toolbar__tools__button tlui-toolbar__overflow"
													icon="chevron-up"
													data-testid="tools.more"
													title={msg('tool-panel.more')}
												/>
											</M.Trigger>
											<M.Content side="top" align="center">
												<OverflowToolsContent
													toolbarItems={[
														...itemsInPanel.filter((item) => !itemsInDropdown.includes(item)),
														...itemsInDropdown,
													]}
												/>
											</M.Content>
										</M.Root>
									</>
								) : null}
							</>
						)}
					</div>
				</div>
				{/* {breakpoint < 5 && !isReadonly && (
					<div className="tlui-toolbar__tools">
						<MobileStylePanel />
					</div>
				)} */}
			</div>
		</div>
	)
})

const OverflowToolsContent = track(function OverflowToolsContent({
	toolbarItems,
}: {
	toolbarItems: TLUiToolbarItem[]
}) {
	const msg = useTranslation()

	return (
		<div className="tlui-button-grid__four tlui-button-grid__reverse">
			{toolbarItems.map(({ toolItem: { id, meta, kbd, label, onSelect, icon } }) => {
				return (
					<M.Item
						key={id}
						className="tlui-button-grid__button"
						data-testid={`tools.${id}`}
						data-tool={id}
						data-geo={meta?.geo ?? ''}
						aria-label={label}
						onClick={() => onSelect('toolbar')}
						title={label ? `${msg(label)} ${kbd ? kbdStr(kbd) : ''}` : ''}
						icon={icon}
					/>
				)
			})}
		</div>
	)
})

function ToolbarButton({
	item,
	title,
	isSelected,
}: {
	item: TLUiToolItem
	title: string
	isSelected: boolean
}) {
	return (
		<Button
			className="tlui-toolbar__tools__button"
			data-testid={`tools.${item.id}`}
			data-tool={item.id}
			data-geo={item.meta?.geo ?? ''}
			aria-label={item.label}
			title={title}
			icon={item.icon}
			data-state={isSelected ? 'selected' : undefined}
			onClick={() => item.onSelect('toolbar')}
			onTouchStart={(e) => {
				preventDefault(e)
				item.onSelect('toolbar')
			}}
		/>
	)
}

const isActiveTLUiToolItem = (
	item: TLUiToolItem,
	activeToolId: string | undefined,
	geoState: string | null | undefined
) => {
	return item.meta?.geo
		? activeToolId === 'geo' && geoState === item.meta?.geo
		: activeToolId === item.id
}

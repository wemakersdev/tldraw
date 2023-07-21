import { getAssetUrlsByMetaUrl } from '@tldraw/assets/urls'
import { DefaultErrorFallback, ErrorBoundary, setDefaultUiAssetUrls } from '@tldraw/tldraw'
import { setDefaultEditorAssetUrls } from '@tldraw/tldraw/src/lib/utils/assetUrls'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'
import YjsExample from './yjs/YjsExample'

// This example is only used for end to end tests

// we use secret internal `setDefaultAssetUrls` functions to set these at the
// top-level so assets don't need to be passed down in every single example.
const assetUrls = getAssetUrlsByMetaUrl()
setDefaultEditorAssetUrls(assetUrls)
setDefaultUiAssetUrls(assetUrls)

type Example = {
	path: string
	title?: string
	element: JSX.Element
}

export const allExamples: Example[] = [
	{
		title: 'Collaboration (with Yjs)',
		path: '/:roomId',
		element: <YjsExample />,
	},
]

function App() {
	const generateRoomId = () => {
		return (
			Math.random().toString(36).substring(2, 5) +
			'-' +
			Math.random().toString(36).substring(2, 5) +
			'-' +
			Math.random().toString(36).substring(2, 5)
		)
	}
	return (
		<div className="examples">
			{/* redirect */}
			<Navigate to={`/${generateRoomId()}`} />
		</div>
	)
}

const router = createBrowserRouter([
	...allExamples,
	{
		path: '/',
		element: <App />,
	},
])
const rootElement = document.getElementById('root')
const root = createRoot(rootElement!)

root.render(
	<StrictMode>
		<ErrorBoundary
			fallback={(error) => <DefaultErrorFallback error={error} />}
			onError={(error) => console.error(error)}
		>
			<RouterProvider router={router} />
		</ErrorBoundary>
	</StrictMode>
)

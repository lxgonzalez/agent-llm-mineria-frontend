import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppSidebar } from './components/app-sidebar'
import { SidebarProvider } from './components/ui/sidebar'
import ChatPage from './components/app-chat'

function App() {
  return (
    <SidebarProvider>
      <Router>
        <AppSidebar />
        <main className="flex flex-1 flex-col overflow-hidden">
          <Routes>
            {/* <Route path="/" element={<HomePage />} /> */}
            <Route path="/chat" element={<ChatPage />} />
          </Routes>
        </main>
      </Router>
    </SidebarProvider>
  )
}

export default App

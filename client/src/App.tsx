import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom"
import type { CSSProperties } from "react"
import HomePage from "./pages/HomePage"
import BeforePage from "./pages/BeforePage"
import AfterPage from "./pages/AfterPage"

const navStyles: Record<string, CSSProperties> = {
  nav: {
    display: "flex",
    alignItems: "center",
    padding: "0 24px",
    height: 52,
    borderBottom: "1px solid #e5e7eb",
    background: "#fff",
    position: "sticky" as const,
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontSize: 16,
    fontWeight: 700,
    color: "#111827",
    textDecoration: "none",
    marginRight: 32,
  },
  links: {
    display: "flex",
    gap: 4,
  },
  link: {
    padding: "6px 14px",
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 500,
    textDecoration: "none",
    color: "#6b7280",
    transition: "all 0.15s",
  },
  linkActive: {
    background: "#eff6ff",
    color: "#3b82f6",
  },
}

const NavBar = () => {
  const location = useLocation()

  const linkStyle = (path: string): CSSProperties => ({
    ...navStyles.link,
    ...(location.pathname === path ? navStyles.linkActive : {}),
  })

  return (
    <nav style={navStyles.nav}>
      <Link to="/" style={navStyles.logo}>WebMCP Demo</Link>
      <div style={navStyles.links}>
        <Link to="/before" style={linkStyle("/before")}>Before</Link>
        <Link to="/after" style={linkStyle("/after")}>After</Link>
      </div>
    </nav>
  )
}

const Layout = ({ children }: { children: React.ReactNode }) => (
  <>
    <NavBar />
    {children}
  </>
)

const App = () => (
  <BrowserRouter>
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/before" element={<BeforePage />} />
        <Route path="/after" element={<AfterPage />} />
      </Routes>
    </Layout>
  </BrowserRouter>
)

export default App

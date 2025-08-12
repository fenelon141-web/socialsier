import{r as c,j as e,P as j,a as y,q as k,i as S,l as I,m as C,n as L,o as O,L as h,I as x,B as f,s as g}from"./index-B6L_YNij.js";

// Separator component (unchanged behavior, but with clearer internals)
var P = "Separator";
var ORIENTATIONS = ["horizontal", "vertical"];

var SeparatorPrimitive = c.forwardRef((props, ref) => {
  const { decorative = false, orientation = "horizontal", ...rest } = props;
  const resolvedOrientation = ORIENTATIONS.includes(orientation) ? orientation : "horizontal";
  const accessibilityProps = decorative ? { role: "none" } : { role: "separator", "aria-orientation": resolvedOrientation === "vertical" ? "vertical" : void 0 };
  return e.jsx(j.div, { "data-orientation": resolvedOrientation, ...accessibilityProps, ...rest, ref });
});
SeparatorPrimitive.displayName = P;
var v = SeparatorPrimitive;

const Separator = c.forwardRef(({ className, orientation = "horizontal", decorative = true, ...rest }, ref) => e.jsx(v, { ref, decorative, orientation, className: y("shrink-0 bg-border", orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]", className), ...rest }));
Separator.displayName = v.displayName;

// --- Auth hook (rewritten to be SSR-safe and robust) ---
function useAuth() {
  const [user, setUser] = c.useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("auth_user");
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.warn("Failed to parse auth_user from localStorage", err);
      return null;
    }
  });

  const [isLoading, setIsLoading] = c.useState(false);

  const login = (email, password) => {
    // synchronous demo login for now. If you replace with an async API call, return a promise.
    setIsLoading(true);
    try {
      const userObj = { id: Date.now().toString(), email, name: String(email).split("@")[0] };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("auth_user", JSON.stringify(userObj));
          localStorage.setItem("auth_token", "token_" + Date.now());
        } catch (err) {
          console.warn("Failed to persist auth info", err);
        }
      }
      setUser(userObj);
      return userObj;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_token");
      } catch (err) {
        console.warn("Failed to remove auth info", err);
      }
    }
    setUser(null);
  };

  const handleDeepLink = (str) => {
    try {
      if (typeof str !== "string" || !str.includes("auth/callback")) return false;
      const url = new URL(str, typeof window !== "undefined" ? window.location.origin : undefined);
      const token = url.searchParams.get("token");
      const email = url.searchParams.get("email") || "deeplink@example.com";
      if (token) {
        const p = { id: `deeplink_${Date.now()}`, email, name: "Deep Link User" };
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("auth_user", JSON.stringify(p));
            localStorage.setItem("auth_token", token);
          } catch (err) {
            console.warn("Failed to persist deep link auth", err);
          }
        }
        setUser(p);
        return true;
      }
    } catch (err) {
      console.warn("handleDeepLink error", err);
    }
    return false;
  };

  c.useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.href && window.location.href.includes("auth/callback")) {
      handleDeepLink(window.location.href);
    }
    // empty deps: run on mount
  }, []);

  return { user, isLoading, isAuthenticated: !!user, login, logout, handleDeepLink };
}

// --- Login page/component (R) ---
function R() {
  const [, navigate] = k();
  const { login } = useAuth();
  const [form, setForm] = c.useState({ email: "", password: "" });
  const { toast } = S();
  const [isSubmitting, setIsSubmitting] = c.useState(false);

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!form.email || !form.password) {
      toast({ title: "Missing information", description: "Please enter both email and password", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      // login might be sync or async; await to be safe
      await Promise.resolve(login(form.email, form.password));
      toast({ title: "Welcome back!", description: "You're now logged in to Socialiser" });
      navigate("/home");
    } catch (err) {
      console.error("Login error", err);
      toast({ title: "Login failed", description: "Please try again", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onChange = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  return e.jsx("div", { className: "min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4 ios-safe-area", children: e.jsxs(I, { className: "w-full max-w-md card-gradient rounded-2xl shadow-2xl border-0", children: [e.jsxs(C, { className: "text-center space-y-2 pb-6", children: [e.jsx("div", { className: "mx-auto w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4", children: "S" }), e.jsx(L, { className: "text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-tran
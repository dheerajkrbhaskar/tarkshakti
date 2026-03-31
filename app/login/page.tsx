export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl text-foreground font-bold mb-6 text-center">Welcome back</h2>
        <form className="space-y-6">
          <div className="max-w-md mx-auto">
            <label className="block text-foreground/70 mb-1" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              placeholder="johndoe@example.com"
              className="w-full border border-foreground/30 rounded py-3 px-4 text-foreground outline-none focus:border-accent focus:ring-0 focus:border-l-4 focus:border-l-accent transition"
            />
          </div>
          <div className="max-w-md mx-auto">
            <label className="block text-foreground/70 mb-1" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              className="w-full border border-foreground/30 rounded py-3 px-4 text-foreground outline-none focus:border-accent focus:ring-0 focus:border-l-4 focus:border-l-accent transition"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-accent focus:ring-accent border-foreground/30 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-foreground/70 text-sm">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-accent hover:text-accent/80">
                Forgot your password?
              </a>
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent/90 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
           >
              Log in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
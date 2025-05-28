
import React, { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Checkbox } from "./checkbox";
import { getLocalStorage, setLocalStorage } from "@/lib/utils";

interface LoginProps {
  onLogin: (nickname: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [nickname, setNickname] = useState(getLocalStorage("playerNickname") || "");
  const [password, setPassword] = useState(getLocalStorage("playerPassword") || "");
  const [rememberMe, setRememberMe] = useState(getLocalStorage("rememberMe") || false);
  const [autoLogin, setAutoLogin] = useState(getLocalStorage("autoLogin") || false);

  const handleLogin = () => {
    if (nickname.trim()) {
      // Salvar informações localmente se "Remember Me" estiver marcado
      if (rememberMe) {
        setLocalStorage("playerNickname", nickname);
        setLocalStorage("playerPassword", password);
        setLocalStorage("rememberMe", true);
      } else {
        setLocalStorage("playerNickname", "");
        setLocalStorage("playerPassword", "");
        setLocalStorage("rememberMe", false);
      }
      
      if (autoLogin) {
        setLocalStorage("autoLogin", true);
      } else {
        setLocalStorage("autoLogin", false);
      }

      // Salvar dados do jogador
      setLocalStorage("currentPlayer", {
        nickname: nickname,
        loginTime: new Date().toISOString()
      });

      onLogin(nickname);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-amber-900 via-red-900 to-black bg-cover bg-center flex items-center justify-center">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      {/* Left character illustration area */}
      <div className="absolute left-8 bottom-8 w-64 h-96 opacity-80">
        <div className="w-full h-full bg-gradient-to-t from-amber-600/20 to-transparent rounded-lg border border-amber-500/30"></div>
      </div>

      {/* Right character illustration area */}
      <div className="absolute right-8 bottom-8 w-64 h-96 opacity-80">
        <div className="w-full h-full bg-gradient-to-t from-red-600/20 to-transparent rounded-lg border border-red-500/30"></div>
      </div>

      {/* Login panel */}
      <Card className="relative z-10 w-96 bg-gradient-to-b from-amber-950/90 to-red-950/90 border-2 border-amber-600/50 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-4xl font-bold text-amber-300 mb-4">
            CIDADE 3D
          </CardTitle>
          <div className="text-amber-200 text-sm font-medium">
            Login
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-amber-200 text-sm font-medium">Nickname</label>
            <Input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-black/50 border-amber-600/50 text-amber-100 placeholder-amber-300/50 focus:border-amber-400"
              placeholder="Digite seu nickname"
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <label className="text-amber-200 text-sm font-medium">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-black/50 border-amber-600/50 text-amber-100 placeholder-amber-300/50 focus:border-amber-400"
              placeholder="Digite sua senha"
              autoComplete="current-password"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(!!checked)}
                className="border-amber-600/50 data-[state=checked]:bg-amber-600"
              />
              <label htmlFor="remember" className="text-amber-200 text-sm cursor-pointer">
                Remember Me
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="autologin"
                checked={autoLogin}
                onCheckedChange={(checked) => setAutoLogin(!!checked)}
                className="border-amber-600/50 data-[state=checked]:bg-amber-600"
              />
              <label htmlFor="autologin" className="text-amber-200 text-sm cursor-pointer">
                Automatic Log In
              </label>
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleLogin}
              disabled={!nickname.trim()}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-black font-bold py-3 text-lg border border-amber-400"
            >
              Login
            </Button>
          </div>

          <div className="text-center pt-2">
            <button className="text-amber-300 text-sm hover:text-amber-200 underline">
              Forgot Password?
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Bottom decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent"></div>
    </div>
  );
}

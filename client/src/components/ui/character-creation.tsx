
import React, { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { getLocalStorage, setLocalStorage } from "@/lib/utils";

interface CharacterData {
  name: string;
  gender: "male" | "female";
  face: number;
  skinColor: number;
  hairStyle: number;
  hairColor: number;
  beard: number;
}

interface CharacterCreationProps {
  onCharacterCreated: (character: CharacterData) => void;
  onBack: () => void;
}

export function CharacterCreation({ onCharacterCreated, onBack }: CharacterCreationProps) {
  const [step, setStep] = useState<"gender" | "customization">("gender");
  const [character, setCharacter] = useState<CharacterData>({
    name: "",
    gender: "male",
    face: 0,
    skinColor: 0,
    hairStyle: 0,
    hairColor: 0,
    beard: 0,
  });

  const faceOptions = Array.from({ length: 12 }, (_, i) => i);
  const skinColorOptions = [
    "#f5deb3", "#deb887", "#d2b48c", "#bc9a6a", "#a0522d", 
    "#8b4513", "#654321", "#3d2914", "#2f1b14", "#1a0e0a"
  ];
  const hairStyleOptions = Array.from({ length: 15 }, (_, i) => i);
  const hairColorOptions = [
    "#000000", "#2c1810", "#4a3728", "#6b4423", "#8b4513",
    "#a0522d", "#cd853f", "#daa520", "#b8860b", "#ffd700",
    "#ffff00", "#ff6347", "#ff4500", "#8b0000", "#4b0082"
  ];
  const beardOptions = Array.from({ length: 8 }, (_, i) => i);

  const handleGenderSelection = (selectedGender: "male" | "female") => {
    setCharacter(prev => ({ ...prev, gender: selectedGender }));
    setStep("customization");
  };

  const handleCreateCharacter = () => {
    if (character.name.trim()) {
      // Salvar dados do personagem localmente
      setLocalStorage("characterData", character);
      onCharacterCreated(character);
    }
  };

  const renderGenderSelection = () => (
    <div className="fixed inset-0 bg-gradient-to-br from-amber-900 via-red-900 to-black bg-cover bg-center flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40"></div>
      
      {/* Character preview areas */}
      <div className="absolute left-8 top-1/2 transform -translate-y-1/2 w-80 h-96 opacity-80">
        <div className="w-full h-full bg-gradient-to-t from-amber-600/20 to-transparent rounded-lg border border-amber-500/30 flex items-end justify-center pb-8">
          <div className="text-6xl">⚔️</div>
        </div>
      </div>

      <div className="absolute right-8 top-1/2 transform -translate-y-1/2 w-80 h-96 opacity-80">
        <div className="w-full h-full bg-gradient-to-t from-red-600/20 to-transparent rounded-lg border border-red-500/30 flex items-end justify-center pb-8">
          <div className="text-6xl">🏹</div>
        </div>
      </div>

      {/* Gender selection panel */}
      <Card className="relative z-10 w-96 bg-gradient-to-b from-amber-950/90 to-red-950/90 border-2 border-amber-600/50 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-4xl font-bold text-amber-300 mb-4">
            CIDADE 3D
          </CardTitle>
          <div className="text-amber-200 text-lg font-medium">
            CREATE CHARACTER
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Button
              onClick={() => handleGenderSelection("male")}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-6 text-xl border border-blue-400"
            >
              <span className="mr-3 text-2xl">♂</span>
              Male
            </Button>
            
            <Button
              onClick={() => handleGenderSelection("female")}
              className="w-full bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-500 hover:to-pink-600 text-white font-bold py-6 text-xl border border-pink-400"
            >
              <span className="mr-3 text-2xl">♀</span>
              Female
            </Button>
          </div>

          <div className="pt-4">
            <Button
              onClick={onBack}
              className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-3 text-lg border border-gray-400"
            >
              ← Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCustomization = () => (
    <div className="fixed inset-0 bg-gradient-to-br from-amber-900 via-red-900 to-black bg-cover bg-center flex">
      <div className="absolute inset-0 bg-black/40"></div>
      
      {/* Character preview */}
      <div className="relative z-10 flex-1 flex items-center justify-center">
        <div className="w-96 h-[600px] bg-gradient-to-t from-amber-600/20 to-transparent rounded-lg border border-amber-500/30 flex items-center justify-center">
          <div className="text-center">
            <div className="text-8xl mb-4">
              {character.gender === "male" ? "🧙‍♂️" : "🧙‍♀️"}
            </div>
            <div className="text-amber-200 text-xl font-bold">
              {character.name || "Your Character"}
            </div>
          </div>
        </div>
      </div>

      {/* Customization panel */}
      <div className="relative z-10 w-96 bg-gradient-to-b from-amber-950/95 to-red-950/95 border-l-2 border-amber-600/50 backdrop-blur-sm overflow-y-auto">
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-amber-300 mb-2">CUSTOMIZE CHARACTER</h2>
            <div className="text-amber-200 text-sm">
              Gender: {character.gender === "male" ? "♂ Male" : "♀ Female"}
            </div>
          </div>

          <div className="space-y-6">
            {/* Character Name */}
            <div className="space-y-2">
              <label className="text-amber-200 text-sm font-medium">Character Name</label>
              <Input
                type="text"
                value={character.name}
                onChange={(e) => setCharacter(prev => ({ ...prev, name: e.target.value }))}
                className="bg-black/50 border-amber-600/50 text-amber-100 placeholder-amber-300/50 focus:border-amber-400"
                placeholder="Enter character name"
                maxLength={20}
              />
            </div>

            {/* Face Selection */}
            <div className="space-y-3">
              <label className="text-amber-200 text-sm font-medium">Face: Type {character.face + 1}</label>
              <div className="grid grid-cols-4 gap-2">
                {faceOptions.map((face) => (
                  <button
                    key={face}
                    onClick={() => setCharacter(prev => ({ ...prev, face }))}
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg transition-all ${
                      character.face === face
                        ? "border-amber-400 bg-amber-600/50"
                        : "border-amber-600/50 bg-black/30 hover:bg-amber-600/20"
                    }`}
                  >
                    😊
                  </button>
                ))}
              </div>
            </div>

            {/* Skin Color */}
            <div className="space-y-3">
              <label className="text-amber-200 text-sm font-medium">Skin Color: Medium {character.skinColor + 1}</label>
              <div className="grid grid-cols-5 gap-2">
                {skinColorOptions.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => setCharacter(prev => ({ ...prev, skinColor: index }))}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      character.skinColor === index
                        ? "border-amber-400 scale-110"
                        : "border-amber-600/50 hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Hair Style */}
            <div className="space-y-3">
              <label className="text-amber-200 text-sm font-medium">Hair Style: Classic {character.hairStyle + 1}</label>
              <div className="grid grid-cols-5 gap-2">
                {hairStyleOptions.map((style) => (
                  <button
                    key={style}
                    onClick={() => setCharacter(prev => ({ ...prev, hairStyle: style }))}
                    className={`w-10 h-10 rounded border-2 flex items-center justify-center text-sm transition-all ${
                      character.hairStyle === style
                        ? "border-amber-400 bg-amber-600/50"
                        : "border-amber-600/50 bg-black/30 hover:bg-amber-600/20"
                    }`}
                  >
                    💇
                  </button>
                ))}
              </div>
            </div>

            {/* Hair Color */}
            <div className="space-y-3">
              <label className="text-amber-200 text-sm font-medium">Hair Color</label>
              <div className="grid grid-cols-5 gap-2">
                {hairColorOptions.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => setCharacter(prev => ({ ...prev, hairColor: index }))}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      character.hairColor === index
                        ? "border-amber-400 scale-110"
                        : "border-amber-600/50 hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Beard (only for male) */}
            {character.gender === "male" && (
              <div className="space-y-3">
                <label className="text-amber-200 text-sm font-medium">Beard: Clean-Shaven {character.beard + 1}</label>
                <div className="grid grid-cols-4 gap-2">
                  {beardOptions.map((beard) => (
                    <button
                      key={beard}
                      onClick={() => setCharacter(prev => ({ ...prev, beard }))}
                      className={`w-10 h-10 rounded border-2 flex items-center justify-center text-sm transition-all ${
                        character.beard === beard
                          ? "border-amber-400 bg-amber-600/50"
                          : "border-amber-600/50 bg-black/30 hover:bg-amber-600/20"
                      }`}
                    >
                      🧔
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 space-y-3">
            <Button
              onClick={handleCreateCharacter}
              disabled={!character.name.trim()}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-3 text-lg border border-green-400"
            >
              Create Character
            </Button>

            <div className="flex gap-3">
              <Button
                onClick={() => setStep("gender")}
                className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-2 border border-gray-400"
              >
                ← Back
              </Button>
              
              <Button
                onClick={() => {
                  setCharacter({
                    name: character.name,
                    gender: character.gender,
                    face: Math.floor(Math.random() * faceOptions.length),
                    skinColor: Math.floor(Math.random() * skinColorOptions.length),
                    hairStyle: Math.floor(Math.random() * hairStyleOptions.length),
                    hairColor: Math.floor(Math.random() * hairColorOptions.length),
                    beard: Math.floor(Math.random() * beardOptions.length),
                  });
                }}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-bold py-2 border border-purple-400"
              >
                🎲 Random
              </Button>
            </div>
          </div>

          <div className="mt-4 text-xs text-amber-300/70 text-center">
            NOTE: Your character's gender, appearance and name cannot be changed beyond your character's creation. Characters cannot be changed!
          </div>
        </div>
      </div>
    </div>
  );

  return step === "gender" ? renderGenderSelection() : renderCustomization();
}

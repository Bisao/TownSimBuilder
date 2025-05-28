
import React, { useState } from "react";
import { Button } from "./button";
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

interface CharacterSelectionProps {
  onCharacterSelected: (character: CharacterData) => void;
  onCreateNewCharacter: () => void;
  onBack: () => void;
}

export function CharacterSelection({ onCharacterSelected, onCreateNewCharacter, onBack }: CharacterSelectionProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterData | null>(null);
  
  // Get existing character from localStorage
  const existingCharacter = getLocalStorage("characterData") as CharacterData | null;

  const handleEnterWorld = () => {
    if (selectedCharacter) {
      onCharacterSelected(selectedCharacter);
    }
  };

  const handleDeleteCharacter = () => {
    setLocalStorage("characterData", null);
    onCreateNewCharacter();
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-black bg-cover bg-center flex">
      <div className="absolute inset-0 bg-black/50"></div>
      
      {/* Character list panel */}
      <div className="relative z-10 w-80 bg-gradient-to-b from-amber-950/95 to-red-950/95 border-r-2 border-amber-600/50 backdrop-blur-sm">
        <div className="p-6">
          <div className="text-center mb-6">
            <CardTitle className="text-3xl font-bold text-amber-300 mb-2">
              CHARACTERS
            </CardTitle>
          </div>

          <div className="space-y-4">
            {existingCharacter ? (
              <Card 
                className={`bg-gradient-to-r from-amber-800/50 to-amber-700/50 border-2 cursor-pointer transition-all ${
                  selectedCharacter ? "border-amber-400 bg-amber-600/30" : "border-amber-600/50 hover:border-amber-500"
                }`}
                onClick={() => setSelectedCharacter(existingCharacter)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center">
                      <span className="text-2xl">
                        {existingCharacter.gender === "male" ? "👨" : "👩"}
                      </span>
                    </div>
                    <div>
                      <div className="text-amber-100 font-bold text-lg">
                        {existingCharacter.name}
                      </div>
                      <div className="text-amber-300 text-sm">
                        The Lighthouse
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center text-amber-300/70 py-8">
                No characters found
              </div>
            )}

            {/* Add Character Button */}
            <Button
              onClick={onCreateNewCharacter}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-6 text-lg border border-green-400"
            >
              <span className="mr-2">➕</span>
              Add Character
            </Button>
          </div>

          {/* Character Actions */}
          {existingCharacter && selectedCharacter && (
            <div className="mt-6 space-y-3">
              <Button
                onClick={handleDeleteCharacter}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3 border border-red-400"
              >
                🗑️ Delete Character
              </Button>
            </div>
          )}

          <div className="mt-8">
            <Button
              onClick={onBack}
              className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-3 border border-gray-400"
            >
              ← Back to Login
            </Button>
          </div>
        </div>
      </div>

      {/* Character preview area */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Character 3D preview */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-96 h-[500px] bg-gradient-to-t from-purple-600/20 to-transparent rounded-lg border border-purple-500/30 flex items-center justify-center">
            {selectedCharacter ? (
              <div className="text-center">
                <div className="text-9xl mb-4">
                  {selectedCharacter.gender === "male" ? "🧙‍♂️" : "🧙‍♀️"}
                </div>
                <div className="text-purple-200 text-2xl font-bold mb-2">
                  {selectedCharacter.name}
                </div>
                <div className="text-purple-300 text-lg">
                  Level 1 Adventurer
                </div>
              </div>
            ) : (
              <div className="text-center text-purple-300/70">
                <div className="text-6xl mb-4">⚔️</div>
                <div className="text-xl">Select a character</div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom action bar */}
        <div className="p-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex justify-center space-x-4">
            <Button
              onClick={handleEnterWorld}
              disabled={!selectedCharacter}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-4 px-12 text-xl border-2 border-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🌍 ENTER WORLD
            </Button>

            <Button
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-4 px-8 text-lg border border-blue-400"
            >
              📖 Play Tutorial
            </Button>
          </div>

          {/* Server info */}
          <div className="mt-4 text-center">
            <div className="inline-flex items-center space-x-4 bg-black/50 px-4 py-2 rounded-lg border border-amber-600/30">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-amber-200 text-sm">Server: Online</span>
              </div>
              <div className="text-amber-300 text-sm">
                🏆 0 Gold
              </div>
              <div className="text-amber-300 text-sm">
                ⭐ Premium: Inactive
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

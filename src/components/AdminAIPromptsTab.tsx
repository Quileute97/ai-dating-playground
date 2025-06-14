import React from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AIPrompt } from "@/types/admin";

interface Props {
  aiPrompts: AIPrompt[];
  setShowAddPromptModal: (v: boolean) => void;
  handleEditAIPrompt: (p: AIPrompt) => void;
  handleDeletePrompt: (id: string) => void;
}

const AdminAIPromptsTab: React.FC<Props> = ({
  aiPrompts,
  setShowAddPromptModal,
  handleEditAIPrompt,
  handleDeletePrompt,
}) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">Quản lý AI Prompts</h2>
      <Button
        onClick={() => setShowAddPromptModal(true)}
        className="bg-gradient-to-r from-blue-500 to-purple-500"
      >
        <Plus className="w-4 h-4 mr-2" />
        Thêm prompt mới
      </Button>
    </div>
    <div className="grid gap-4">
      {aiPrompts.map((prompt) => (
        <Card key={prompt.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{prompt.name}</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                    {prompt.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{prompt.description}</p>
                <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  {prompt.prompt.substring(0, 150)}...
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditAIPrompt(prompt)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleDeletePrompt(prompt.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default AdminAIPromptsTab;

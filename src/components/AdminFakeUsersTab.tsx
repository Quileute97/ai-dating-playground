
import React from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FakeUserChatModal from "./FakeUserChatModal";
import PostAsFakeUserModal from "./PostAsFakeUserModal";
import { FakeUser, AIPrompt } from "./AdminDashboard"; 

interface Props {
  fakeUsers: FakeUser[];
  setShowAddUserModal: (v: boolean) => void;
  chatFakeUser: FakeUser | null;
  setChatFakeUser: (u: FakeUser | null) => void;
  postFakeUser: FakeUser | null;
  setPostFakeUser: (u: FakeUser | null) => void;
  handleEditFakeUser: (u: FakeUser) => void;
  handleDeleteUser: (id: string) => void;
  user: any;
  aiPrompts: AIPrompt[];
  handlePostAsFakeUser: (content: string, user: FakeUser) => void;
}

const AdminFakeUsersTab: React.FC<Props> = ({
  fakeUsers,
  setShowAddUserModal,
  chatFakeUser,
  setChatFakeUser,
  postFakeUser,
  setPostFakeUser,
  handleEditFakeUser,
  handleDeleteUser,
  user,
  aiPrompts,
  handlePostAsFakeUser,
}) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">Quản lý người dùng ảo</h2>
      <Button
        onClick={() => setShowAddUserModal(true)}
        className="bg-gradient-to-r from-purple-500 to-pink-500"
      >
        <Plus className="w-4 h-4 mr-2" />
        Thêm user ảo
      </Button>
    </div>
    <div className="grid gap-4">
      {fakeUsers.map((user) => (
        <Card key={user.id}>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{user.name}</h3>
                  <span className="text-sm text-gray-600">
                    {user.gender === "female" ? "♀" : "♂"} {user.age} tuổi
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {user.isActive ? "Hoạt động" : "Tạm dừng"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{user.bio}</p>
                <p className="text-xs text-gray-500 italic">
                  AI Prompt: {user.aiPrompt.substring(0, 100)}...
                </p>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setChatFakeUser(user)}
                  >
                    Nhắn tin
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setPostFakeUser(user)}
                  >
                    Đăng bài
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditFakeUser(user)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleDeleteUser(user.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
    {/* Modal chat với user ảo */}
    <FakeUserChatModal
      isOpen={!!chatFakeUser}
      user={chatFakeUser && {
        id: chatFakeUser.id,
        name: chatFakeUser.name,
        avatar: chatFakeUser.avatar,
        aiPrompt: chatFakeUser.aiPrompt
      }}
      onClose={() => setChatFakeUser(null)}
      userRealId={user?.id || ""}
    />
    {/* Modal đăng bài với user ảo */}
    <PostAsFakeUserModal
      isOpen={!!postFakeUser}
      user={postFakeUser && {
        id: postFakeUser.id,
        name: postFakeUser.name,
        avatar: postFakeUser.avatar
      }}
      onClose={() => setPostFakeUser(null)}
      onPost={content => {
        if (postFakeUser) handlePostAsFakeUser(content, postFakeUser);
      }}
    />
  </div>
);

export default AdminFakeUsersTab;

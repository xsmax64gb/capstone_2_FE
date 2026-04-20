"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, ChevronsUpDown, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { API_BASE_URL } from "@/config/api";
import { tokenManager } from "@/lib/token-manager";

interface User {
  id: string;
  name: string;
  email: string;
  currentLevel?: string;
}

interface UserSearchComboboxProps {
  selectedUser: { id: string; name: string; email: string } | null;
  onSelectUser: (user: { id: string; name: string; email: string } | null) => void;
}

const buildApiUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const normalizedBase = API_BASE_URL.trim();

  if (!normalizedBase) {
    return normalizedPath;
  }

  if (/^https?:\/\//i.test(normalizedBase)) {
    return `${normalizedBase.replace(/\/$/, "")}${normalizedPath}`;
  }

  const prefixedBase = normalizedBase.startsWith("/")
    ? normalizedBase
    : `/${normalizedBase}`;

  return `${prefixedBase.replace(/\/$/, "")}${normalizedPath}`;
};

const getAuthHeaders = () => {
  const token = tokenManager.getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export function UserSearchCombobox({ selectedUser, onSelectUser }: UserSearchComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        buildApiUrl(`/admin/users?search=${encodeURIComponent(query)}&limit=10`),
        {
          headers: getAuthHeaders(),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const userList = data.data?.users || [];
        setUsers(
          userList.map((u: any) => ({
            id: u.id || u._id,
            name: u.fullName || u.name || "Unknown",
            email: u.email || "",
            currentLevel: u.currentLevel,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to search users:", error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchUsers(searchQuery);
      } else {
        setUsers([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchUsers]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-11 w-full justify-between rounded-xl"
        >
          {selectedUser ? (
            <span className="truncate">{selectedUser.name}</span>
          ) : (
            <span className="text-slate-500">Tìm kiếm người dùng...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="Tìm theo tên hoặc email..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="h-11"
            />
          </div>
          <CommandList>
            {isLoading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              </div>
            )}
            {!isLoading && searchQuery && users.length === 0 && (
              <CommandEmpty>Không tìm thấy người dùng.</CommandEmpty>
            )}
            {!isLoading && !searchQuery && (
              <div className="py-6 text-center text-sm text-slate-500">
                Nhập tên hoặc email để tìm kiếm
              </div>
            )}
            {!isLoading && users.length > 0 && (
              <CommandGroup>
                {users.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={user.id}
                    onSelect={() => {
                      onSelectUser(
                        selectedUser?.id === user.id
                          ? null
                          : {
                              id: user.id,
                              name: user.name,
                              email: user.email,
                            }
                      );
                      setOpen(false);
                      setSearchQuery("");
                    }}
                    className="cursor-pointer"
                  >
                    <div className="flex flex-1 items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate font-medium text-slate-900">
                          {user.name}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {user.email}
                        </p>
                      </div>
                      {user.currentLevel && (
                        <span className="flex-shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                          {user.currentLevel}
                        </span>
                      )}
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4 flex-shrink-0",
                          selectedUser?.id === user.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

"use client"

import { Search } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function SearchBar() {
  return (
    <div className="flex w-full max-w-sm items-center space-x-2 backdrop-blur-3xl shadow-black shadow-2xl">
      <Input
        type="search"
        placeholder="Search contracts..."
        className="w-full"
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Search by Expiry Date</DropdownMenuItem>
          <DropdownMenuItem>Search by Owner</DropdownMenuItem>
          <DropdownMenuItem>Search by Price</DropdownMenuItem>
          <DropdownMenuItem>Search by Title</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}


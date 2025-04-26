"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Filter } from 'lucide-react'

export function CategoryFilter() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[180px]">
          <Filter className="mr-2 h-4 w-4" />
          Filter by Category
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Consulting</DropdownMenuItem>
        <DropdownMenuItem>Sales</DropdownMenuItem>
        <DropdownMenuItem>Contracting</DropdownMenuItem>
        <DropdownMenuItem>Marketing</DropdownMenuItem>
        <DropdownMenuItem>Operation</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


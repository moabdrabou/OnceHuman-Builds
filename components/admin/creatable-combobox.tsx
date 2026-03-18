"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface ComboboxOption {
  value: string
  label: string
}

// Values prefixed with "new:" indicate a user-created item not yet in the DB
const NEW_PREFIX = "new:"

export function isNewItem(value: string): boolean {
  return value.startsWith(NEW_PREFIX)
}

export function getNewItemName(value: string): string {
  return value.slice(NEW_PREFIX.length)
}

export function makeNewValue(name: string): string {
  return `${NEW_PREFIX}${name}`
}

interface CreatableComboboxProps {
  options: ComboboxOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  disabled?: boolean
}

export function CreatableCombobox({
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  className,
  disabled = false,
}: CreatableComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const selectedLabel = React.useMemo(() => {
    if (!value) return null
    if (isNewItem(value)) {
      return getNewItemName(value)
    }
    return options.find((o) => o.value === value)?.label ?? null
  }, [value, options])

  const trimmedSearch = search.trim()

  const exactMatch = React.useMemo(() => {
    if (!trimmedSearch) return true
    const lower = trimmedSearch.toLowerCase()
    return options.some((o) => o.label.toLowerCase() === lower)
  }, [trimmedSearch, options])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex w-full items-center justify-between bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-left text-foreground outline-none transition-all hover:border-slate-700 focus:border-primary/50",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate text-[11px]">
            {selectedLabel ? (
              <span className="flex items-center gap-1.5">
                {isNewItem(value) && (
                  <Plus className="h-3 w-3 text-emerald-400 shrink-0" />
                )}
                {selectedLabel}
              </span>
            ) : (
              placeholder
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-40" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0 bg-slate-950 border border-slate-800"
        align="start"
        sideOffset={4}
      >
        <Command
          className="bg-transparent"
          shouldFilter={true}
        >
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
            className="text-[11px]"
          />
          <CommandList className="max-h-[200px]">
            <CommandEmpty className="py-3 text-center text-[10px] text-muted-foreground">
              {emptyText}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onChange(option.value === value ? "" : option.value)
                    setOpen(false)
                    setSearch("")
                  }}
                  className="text-[11px] cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-3 w-3 shrink-0",
                      value === option.value ? "opacity-100 text-primary" : "opacity-0",
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>

            {/* Create new item option */}
            {trimmedSearch && !exactMatch && (
              <CommandGroup>
                <CommandItem
                  value={`__create__${trimmedSearch}`}
                  onSelect={() => {
                    onChange(makeNewValue(trimmedSearch))
                    setOpen(false)
                    setSearch("")
                  }}
                  className="text-[11px] cursor-pointer border-t border-slate-800"
                  forceMount
                >
                  <Plus className="mr-2 h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">
                    Create &apos;{trimmedSearch}&apos;
                  </span>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

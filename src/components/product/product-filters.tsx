"use client"

import { useState } from "react"
import { Filter, Grid3X3, Grid2X2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

interface ProductFiltersProps {
  totalProducts: number
  currentSort: string
  onSortChange: (sort: string) => void
  showFilters?: boolean
  onToggleFilters?: () => void
  gridCols?: number
  onGridChange?: (cols: number) => void
}

export function ProductFilters({
  totalProducts,
  currentSort,
  onSortChange,
  showFilters = false,
  onToggleFilters,
  gridCols = 4,
  onGridChange
}: ProductFiltersProps) {
  const [priceRange, setPriceRange] = useState<string>("")
  const [availability, setAvailability] = useState<string>("")

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "name-asc", label: "Name: A to Z" },
    { value: "name-desc", label: "Name: Z to A" },
    { value: "featured", label: "Featured" },
  ]

  const priceRanges = [
    { value: "", label: "All Prices" },
    { value: "0-50000", label: "Under Rp 50,000" },
    { value: "50000-100000", label: "Rp 50,000 - Rp 100,000" },
    { value: "100000-250000", label: "Rp 100,000 - Rp 250,000" },
    { value: "250000-500000", label: "Rp 250,000 - Rp 500,000" },
    { value: "500000+", label: "Above Rp 500,000" },
  ]

  const availabilityOptions = [
    { value: "", label: "All Products" },
    { value: "in-stock", label: "In Stock" },
    { value: "out-of-stock", label: "Out of Stock" },
    { value: "low-stock", label: "Low Stock (< 10)" },
  ]

  const activeFiltersCount = [priceRange, availability].filter(Boolean).length

  const clearFilters = () => {
    setPriceRange("")
    setAvailability("")
  }

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Results Count & Filters Toggle */}
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">{totalProducts}</span> products found
          </div>
          
          {onToggleFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleFilters}
              className="relative"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          )}
        </div>

        {/* Right: Sort & Grid Controls */}
        <div className="flex items-center gap-2">
          {/* Sort */}
          <Select value={currentSort} onValueChange={onSortChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Grid Layout */}
          {onGridChange && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  {gridCols === 3 ? (
                    <Grid3X3 className="h-4 w-4" />
                  ) : (
                    <Grid2X2 className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Grid Layout</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onGridChange(3)}>
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  3 Columns
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onGridChange(4)}>
                  <Grid2X2 className="h-4 w-4 mr-2" />
                  4 Columns
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {priceRange && (
            <Badge variant="secondary" className="gap-1">
              Price: {priceRanges.find(r => r.value === priceRange)?.label}
              <button
                onClick={() => setPriceRange("")}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          )}
          
          {availability && (
            <Badge variant="secondary" className="gap-1">
              {availabilityOptions.find(a => a.value === availability)?.label}
              <button
                onClick={() => setAvailability("")}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-6 px-2 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}

      <Separator />

      {/* Filters Panel (if shown) */}
      {showFilters && (
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Price Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Price Range</label>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Prices" />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Availability */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Availability</label>
              <Select value={availability} onValueChange={setAvailability}>
                <SelectTrigger>
                  <SelectValue placeholder="All Products" />
                </SelectTrigger>
                <SelectContent>
                  {availabilityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter Actions */}
            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
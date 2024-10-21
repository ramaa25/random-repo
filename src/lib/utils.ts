import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export type languagesType = {
  title: string
  value: string
}[]

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const dataLanguage = async () => {
  try {
    const response = await fetch("https://raw.githubusercontent.com/kamranahmedse/githunt/master/src/components/filters/language-filter/languages.json")
    const data = await response.json()
    return data
  } catch (error) {
    console.log(error)
  }
}
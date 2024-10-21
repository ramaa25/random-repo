// import { useState } from 'react'
import { CaretSortIcon, CheckIcon, GitHubLogoIcon } from '@radix-ui/react-icons'
import './App.css'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'
import { useTheme } from './components/theme-provider'
import { Switch } from './components/ui/switch'
import { useEffect, useState } from 'react'
import { cn, dataLanguage, languagesType } from './lib/utils'
import { Popover, PopoverContent, PopoverTrigger,  } from './components/ui/popover'
import { Button } from './components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './components/ui/command'
import { FixedSizeList } from 'react-window'

function App() {
  const { setTheme, theme } = useTheme()
  const [loadingState, setLoadingState] = useState({
    loadText: false,
    loadError: false,
    loadSuccess: false,
    loadDataSelect: false
  })
  const [stateText, setStateText] = useState('')
  const [languages, setLanguages] = useState<languagesType>([])
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [randomPage, setRandomPage] = useState(1)
  const [totalPage, setTotalPage] = useState(0)

  const getDataLanguage = async () => {
    setLoadingState({ ...loadingState, loadDataSelect: true })
    try {
      const data: languagesType = await dataLanguage()
      const filteredData = data.filter((language) => language.value !== "")
      setLanguages(filteredData) 
      console.log(data)
    } catch (error) {
      console.error("Error fetching languages:", error)
    } finally {
      setLoadingState((prevState) => ({ ...prevState, loadDataSelect: false }))
    }
  }

  const getDataLanguageSelect = async (param: string) => {
    try {
      const response = await fetch(`https://api.github.com/search/repositories?q=language:${param}&per_page=1&page=${randomPage}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setTotalPage(data.total_count)
      console.log(data);
    } catch (error) {
      console.error("Error fetching languages:", error);
    }
  };

  const filteredLanguages = languages.filter((lang) =>
    lang.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    getDataLanguage()
    setStateText('Please select a language')
  }, [])

  useEffect(() => {
    setRandomPage(Math.floor(Math.random() * totalPage) + 1)
  }, [getDataLanguageSelect])

  return (
    <div className='flex flex-col gap-3'>
      <div className="flex items-center gap-5">
        <GitHubLogoIcon className="w-10 h-10" />
        <h1>Random Github Finder</h1>
      </div>
      <div className="flex flex-col gap-3 items-center">
      <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {value
                ? languages.find((lang) => lang.value === value)?.value
                : "Select languages..."}
              <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search languages..." className="h-9" value={searchTerm} onValueChange={(value) => setSearchTerm(value)} />
              <CommandList>
                <CommandEmpty>No language found.</CommandEmpty>
                <CommandGroup>
                  <FixedSizeList
                    height={275}
                    itemCount={filteredLanguages.length}
                    itemSize={40}
                    width="100%"
                    className='scroll-hidden'
                  >
                  {({ index, style }) => {
                    const lang = filteredLanguages[index]
                    return (
                      <CommandItem
                        key={lang.value}
                        value={lang.value}
                        onSelect={(currentValue) => {
                          setValue(currentValue === value ? "" : currentValue)
                          setOpen(false)
                          getDataLanguageSelect(currentValue)
                        }}
                        style={style}
                      >
                        {lang.title}
                        <CheckIcon
                          className={cn(
                            "ml-auto h-4 w-4",
                            value === lang.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    )
                  }}
                  </FixedSizeList>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <div className="bg-neutral-200 dark:bg-neutral-800 h-20 w-full rounded-lg flex justify-center items-center text-sm lg:text-base">
          <span>{stateText}</span>
        </div>

        <Switch 
          checked={theme === 'dark'} 
          onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
        />
        
      </div>
    </div>
  )
}

export default App

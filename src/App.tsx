// import { useState } from 'react'
import { CaretSortIcon, CheckIcon, GitHubLogoIcon } from '@radix-ui/react-icons'
import './App.css'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'
import { useTheme } from './components/theme-provider'
import { Switch } from './components/ui/switch'
import { useEffect, useRef, useState } from 'react'
import { cn, dataLanguage, LanguageSelectItems, languagesType } from './lib/utils'
import { Popover, PopoverContent, PopoverTrigger,  } from './components/ui/popover'
import { Button } from './components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './components/ui/command'
import { FixedSizeList } from 'react-window'
import { Card, CardDescription, CardHeader, CardTitle } from './components/ui/card'

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
  const [dataGithubSelect, setDataGithubSelect] = useState<LanguageSelectItems>()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [perPage, setPerPage] = useState(1)

  const abortControllerRef = useRef(null);

  const getDataLanguage = async () => {
    setLoadingState({ ...loadingState, loadDataSelect: true })
    setStateText('Loading languages...')
    try {
      const data: languagesType = await dataLanguage()
      const filteredData = data.filter((language) => language.value !== "")
      setLanguages(filteredData)
    } catch (error) {
      console.error("Error fetching languages:", error)
    } finally {
      setLoadingState((prevState) => ({ ...prevState, loadDataSelect: false }))
      setStateText('Please select a language')
    }
  }

  const getDataLanguageSelect = async ({param, type}: {param: string, type?: string}, abortControllerRef: React.MutableRefObject<AbortController | null>) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
  }

  // Buat AbortController baru
  const controller = new AbortController();
  abortControllerRef.current = controller;  // Simpan controller untuk request ini
  const signal = controller.signal;

    if (type === 'query') {
      setStateText('Loading, please wait...')
      setLoadingState({ ...loadingState, loadSuccess: false })
      const randomPage = Math.floor(Math.random() * 1000) + 1
      try {
        const response = await fetch(`https://api.github.com/search/repositories?q=language:${param}&per_page=${perPage}&page=${randomPage}`,
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
            },
            signal
          },
        );
        if (!response.ok) {
          setLoadingState({ ...loadingState, loadError: true })
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        else if (response.ok) {
          const data = await response.json();
          const maxPerPage = Math.round(data.total_count / 1000 - 1) // 1000 is the limit per page from github
          if(value === param && perPage <= maxPerPage) {
            setPerPage(perPage + 1)
          }
          setLoadingState({ ...loadingState, loadSuccess: true })
          setDataGithubSelect(data.items[0])
          console.log(dataGithubSelect)
        }
      } catch (error) {
        console.error("Error fetching languages:", error);
        setLoadingState({ ...loadingState, loadError: true })
      } finally {
        setStateText('Please select a language')
        setLoadingState({ ...loadingState, loadSuccess: true })
      }
    } else {
      setPerPage(1)
    }
  };

  const filteredLanguages = languages.filter((lang) =>
    lang.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    getDataLanguage()
  }, [])

  return (
    <div className='flex flex-col gap-3'>
      <div className="flex items-center gap-5">
        <GitHubLogoIcon className="w-10 h-10" />
        <h1>Random Github Finder</h1>
      </div>
      <div className="flex flex-col gap-3 items-center">
      <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild disabled={loadingState.loadDataSelect}>
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
                          getDataLanguageSelect(currentValue !== value ? {param: currentValue, type: 'query'} : {param: currentValue}, abortControllerRef)
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
        {loadingState.loadSuccess ? (
          <Card>
            <CardHeader>
              <CardTitle>{dataGithubSelect?.name}</CardTitle>
              <CardDescription>{dataGithubSelect?.description}</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className={`${loadingState.loadError ? 'dark:bg-red-800 bg-red-500/50' : 'bg-neutral-200 dark:bg-neutral-800' }  h-20 w-full rounded-lg flex justify-center items-center text-sm lg:text-base`}>
            <span>{stateText}</span>
          </div>
        )}

        <Switch 
          checked={theme === 'dark'} 
          onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
        />
        
      </div>
    </div>
  )
}

export default App

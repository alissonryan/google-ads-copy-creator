'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card } from "@/components/ui/card"
import { ChevronLeftIcon, ChevronRightIcon, CopyIcon, DownloadIcon } from 'lucide-react'
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Home, 
  History, 
  TestTube2, 
  Key, 
  Settings, 
  LogOut 
} from 'lucide-react'
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

type CampaignType = 'search' | 'pmax'

interface UserInput {
  campaignName: string;
  campaignType: CampaignType;
  language: string;
  tone: string;
  description: string;
  searchTerm: string;
  target: string;
  differentials: string;
  finalUrl: string;
  competitors: string;
  ctaCategory: string;
  cta: string;
}

const languages = [
  { value: "pt-BR", label: "Português (Brasileiro)", flag: "🇧🇷" },
  { value: "en", label: "Inglês", flag: "🇺🇸" },
  { value: "es", label: "Espanhol", flag: "🇪🇸" },
]

export function AdCopyCreatorComponent() {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSidebarVisible, setIsSidebarVisible] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [open, setOpen] = useState(false)
  const [userInput, setUserInput] = useState<UserInput>({
    campaignName: '',
    campaignType: 'search',
    language: 'pt-BR',
    tone: '',
    description: '',
    searchTerm: '',
    target: '',
    differentials: '',
    finalUrl: '',
    competitors: '',
    ctaCategory: '',
    cta: '',
  })
  const [generatedContent, setGeneratedContent] = useState({
    keywords: '',
    headlines: Array(15).fill(''),
    longTitles: Array(5).fill(''),
    descriptions: Array(5).fill(''),
    scrapedKeywords: [],
  })
  const [ctaOptions, setCTAOptions] = useState<string[]>([])
  const [activeMenu, setActiveMenu] = useState('gerar')

  const ctaCategories = [
    "Conversão Direta (Vendas, Cadastros)",
    "Geração de Leads",
    "Engajamento",
    "Urgência",
    "Produtos de Luxo",
    "Educação",
    "Incentivo a experimentar"
  ];

  const ctaSuggestions: { [key: string]: string[] } = {
    "Conversão Direta (Vendas, Cadastros)": [
      "Compre Agora", "Inscreva-se Hoje", "Experimente Gratuitamente", "Garanta sua Vaga",
      "Adquira Já", "Assine Agora", "Reserve Seu Lugar", "Comece Já",
      "Solicite Seu Desconto", "Peça uma Demonstração"
    ],
    "Geração de Leads": [
      "Solicite uma Cotação", "Saiba Mais", "Cadastre-se para Mais Informações",
      "Receba Nosso E-book Gratuito", "Fale com um Especialista", "Baixe Agora",
      "Entre em Contato", "Inscreva-se para Atualizações", "Receba um Orçamento",
      "Agende uma Consultoria"
    ],
    "Engajamento": [
      "Participe Agora", "Compartilhe com Seus Amigos", "Comente Aqui",
      "Curta Nossa Página", "Siga-nos", "Deixe Sua Avaliação",
      "Faça Parte da Comunidade", "Envie Sua Opinião", "Descubra Mais",
      "Teste Grátis"
    ],
    "Urgência": [
      "Oferta Por Tempo Limitado", "Aproveite Hoje Mesmo", "Últimos Dias!",
      "Não Perca!", "Garanta Antes que Acabe", "Promoção Exclusiva – Apenas Hoje",
      "Corra, Acaba Logo!", "Últimas Unidades", "Faça Agora ou Perderá!",
      "Oportunidade Única"
    ],
    "Produtos de Luxo": [
      "Experimente o Melhor", "Descubra a Exclusividade", "Viva a Experiência Premium",
      "Redefina Seu Padrão", "Garanta o Máximo de Qualidade", "Conheça a Excelência",
      "Torne-se VIP Agora"
    ],
    "Educação": [
      "Aprenda Mais", "Comece sua Jornada", "Explore o Conteúdo",
      "Descubra Novos Horizontes", "Inscreva-se no Curso", "Tenha Acesso ao Material",
      "Veja Nossos Tutoriais", "Amplie Seu Conhecimento"
    ],
    "Incentivo a experimentar": [
      "Experimente Gratuitamente", "Teste Agora Sem Compromisso", "Veja Como Funciona",
      "Descubra as Vantagens", "Prove por Você Mesmo", "Avalie Gratuitamente"
    ]
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleCTACategoryChange = (category: string) => {
    setUserInput(prev => ({ ...prev, ctaCategory: category }));
    setCTAOptions(ctaSuggestions[category] || []);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setUserInput(prev => ({ ...prev, [id]: value }))
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      // Verifique se todos os campos obrigatórios estão preenchidos
      if (!userInput.campaignName || !userInput.campaignType || !userInput.language || 
          !userInput.tone || !userInput.description || !userInput.searchTerm || 
          !userInput.target || !userInput.differentials) {
        throw new Error('Por favor, preencha todos os campos obrigatórios.');
      }

      // Prepare os dados para enviar
      const dataToSend = {
        ...userInput,
        url: userInput.finalUrl, // Certifique-se de que 'url' está sendo enviado
        keywords: userInput.keywords || [] // Envie keywords como array vazio se não fornecido
      };

      const response = await fetch('/api/generate-ad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha na geração do anúncio');
      }

      const data = await response.json()
      setGeneratedContent({
        keywords: data.keywords || '',
        headlines: data.headlines || [],
        longTitles: data.longTitles || [],
        descriptions: data.descriptions || [],
        scrapedKeywords: data.scrapedKeywords || [],
      })
      toast({
        title: "Sucesso!",
        description: "O anúncio foi gerado com sucesso.",
      })
    } catch (error: any) { // Adicione ': any' para evitar o erro de tipo
      console.error('Erro ao gerar o anúncio:', error)
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao gerar o anúncio. Por favor, tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado!",
      description: "O texto foi copiado para a área de transferência.",
    })
  }

  const handleExportCSV = () => {
    const csvContent = `Keywords,${generatedContent.keywords}\n` +
      generatedContent.headlines.map((h, i) => `Headline ${i+1},${h}`).join('\n') + '\n' +
      (userInput.campaignType === 'pmax' ? generatedContent.longTitles.map((t, i) => `Long Title ${i+1},${t}`).join('\n') + '\n' : '') +
      generatedContent.descriptions.map((d, i) => `Description ${i+1},${d}`).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", "ad_copy.csv")
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const getCharacterCount = (text: string) => text.length;
  const getProgressPercentage = (count: number, limit: number) => Math.min((count / limit) * 100, 100);

  const cleanAndCountCharacters = (text: string, expectedLength: number) => {
    const cleanedText = text.trim();
    const count = cleanedText.length;
    const spaces = cleanedText.split(' ').length - 1;
    const special = cleanedText.replace(/[a-zA-Z0-9\s]/g, '').length;
    
    if (count !== expectedLength) {
      console.warn(`Texto não tem o tamanho esperado: ${count}/${expectedLength} caracteres`);
    }
    
    return { text: cleanedText, count, spaces, special };
  };

  const toneOptions = [
    "Formal", "Informal", "Persuasivo", "Empático", "Engraçado/Divertido", 
    "Urgente", "Autoritário/Confiante", "Inspirador/Motivacional", "Neutro", 
    "Educacional", "Sofisticado/Chique", "Amigável/Conversacional", 
    "Desafiador", "Calmo/Tranquilo"
  ];

  const handleClearFields = () => {
    setUserInput({
      campaignName: '',
      campaignType: 'search',
      language: 'pt-BR',
      tone: '',
      description: '',
      searchTerm: '',
      target: '',
      differentials: '',
      finalUrl: '',
      competitors: '',
      ctaCategory: '',
      cta: '',
    });
    setCTAOptions([]);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <nav className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6 overflow-x-auto">
            <Button
              variant="ghost"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                activeMenu === 'gerar' ? 'text-primary' : 'text-muted-foreground'
              }`}
              onClick={() => setActiveMenu('gerar')}
            >
              <Home className="h-4 w-4 mr-2" />
              Gerar Anúncio
            </Button>
            <Button
              variant="ghost"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                activeMenu === 'historico' ? 'text-primary' : 'text-muted-foreground'
              }`}
              onClick={() => setActiveMenu('historico')}
            >
              <History className="h-4 w-4 mr-2" />
              Histórico de Anúncios
            </Button>
            <Button
              variant="ghost"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                activeMenu === 'testes' ? 'text-primary' : 'text-muted-foreground'
              }`}
              onClick={() => setActiveMenu('testes')}
            >
              <TestTube2 className="h-4 w-4 mr-2" />
              Testes A/B
            </Button>
            <Button
              variant="ghost"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                activeMenu === 'palavras' ? 'text-primary' : 'text-muted-foreground'
              }`}
              onClick={() => setActiveMenu('palavras')}
            >
              <Key className="h-4 w-4 mr-2" />
              Palavras-Chave
            </Button>
          </nav>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src="/path-to-user-image.jpg" />
                <AvatarFallback>UN</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
        {activeMenu === 'gerar' && (
          <div className="flex flex-1 flex-col lg:flex-row overflow-hidden relative">
            {/* Botão de toggle para mobile (mantido à direita) */}
            <Button 
              variant="outline" 
              size="icon"
              className="fixed top-16 right-2 z-20 lg:hidden"
              onClick={() => setIsSidebarVisible(!isSidebarVisible)}
            >
              {isSidebarVisible ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </Button>

            <div 
              className={`
                ${isSidebarVisible ? 'w-full lg:w-96' : 'w-0'}
                flex-shrink-0 transition-all duration-300 ease-in-out
                h-[calc(100vh-3.5rem)] overflow-y-auto
                fixed lg:relative top-14 lg:top-0 right-0 bg-background z-10
              `}
            >
              <div className={`
                p-4 w-full h-full overflow-y-auto
                ${isSidebarVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                transition-all duration-300 ease-in-out
              `}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Configurações</h2>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="lg:flex hidden"
                    onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                  >
                    <ChevronLeftIcon />
                  </Button>
                </div>
                <form className="space-y-4 max-w-sm mx-auto lg:max-w-none" onSubmit={(e) => { e.preventDefault(); handleGenerate(); }}>
                  <h3 className="font-semibold">Campos Obrigatórios</h3>
                  <div>
                    <Label htmlFor="campaignName">Nome da Campanha</Label>
                    <Input 
                      id="campaignName" 
                      value={userInput.campaignName} 
                      onChange={handleInputChange} 
                      placeholder="Nome da Campanha" 
                      required 
                    />
                  </div>
                  <div>
                    <Label>Tipo de Campanha</Label>
                    <RadioGroup 
                      value={userInput.campaignType}
                      className="flex"
                      onValueChange={(value) => setUserInput(prev => ({ ...prev, campaignType: value as CampaignType }))}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="search" id="search" />
                        <Label htmlFor="search">Search</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pmax" id="pmax" />
                        <Label htmlFor="pmax">Pmax</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Idioma</Label>
                    <Select
                      value={userInput.language}
                      onValueChange={(value) => setUserInput(prev => ({ ...prev, language: value }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o idioma" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.flag} {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tone">Tom de voz</Label>
                    <Select
                      value={userInput.tone}
                      onValueChange={(value) => setUserInput(prev => ({ ...prev, tone: value }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o tom de voz" />
                      </SelectTrigger>
                      <SelectContent>
                        {toneOptions.map((tone) => (
                          <SelectItem key={tone} value={tone}>
                            {tone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="description">Descrição Produto/Serviço</Label>
                    <Textarea id="description" value={userInput.description} onChange={handleInputChange} placeholder="Descrição" required />
                  </div>
                  <div>
                    <Label htmlFor="searchTerm">Termo de pesquisa</Label>
                    <Input id="searchTerm" value={userInput.searchTerm} onChange={handleInputChange} placeholder="Termo de pesquisa" required />
                  </div>
                  <div>
                    <Label htmlFor="target">Público-alvo</Label>
                    <Input id="target" value={userInput.target} onChange={handleInputChange} placeholder="Público-alvo" required />
                  </div>
                  <div>
                    <Label htmlFor="differentials">Diferenciais</Label>
                    <Input id="differentials" value={userInput.differentials} onChange={handleInputChange} placeholder="Diferenciais" required />
                  </div>
                  
                  <h3 className="font-semibold mt-6">Campos Opcionais</h3>
                  <div>
                    <Label htmlFor="ctaCategory">Categoria do Call to Action (CTA)</Label>
                    <Select
                      value={userInput.ctaCategory}
                      onValueChange={handleCTACategoryChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione a categoria do CTA" />
                      </SelectTrigger>
                      <SelectContent>
                        {ctaCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {ctaOptions.length > 0 && (
                    <div>
                      <Label htmlFor="cta">Call to Action (CTA)</Label>
                      <Select
                        value={userInput.cta}
                        onValueChange={(value) => setUserInput(prev => ({ ...prev, cta: value }))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione o CTA" />
                        </SelectTrigger>
                        <SelectContent>
                          {ctaOptions.map((cta) => (
                            <SelectItem key={cta} value={cta}>
                              {cta}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="finalUrl">URL Final</Label>
                    <Input id="finalUrl" value={userInput.finalUrl} onChange={handleInputChange} placeholder="URL Final" />
                  </div>
                  <div>
                    <Label htmlFor="competitors">Sites concorrentes</Label>
                    <Textarea id="competitors" value={userInput.competitors} onChange={handleInputChange} placeholder="Coloque 1 site por linha" />
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between mt-6 gap-2">
                    <Button 
                      type="button" 
                      variant="destructive" 
                      onClick={handleClearFields}
                      className="w-full sm:w-auto"
                    >
                      Limpar Campos
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isGenerating}
                      className="w-full sm:w-auto"
                    >
                      {isGenerating ? 'Gerando...' : 'Gerar Anúncio'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            <div className={`
              flex-1 p-2 sm:p-4 overflow-auto transition-all duration-300 ease-in-out
              ${isSidebarVisible ? 'lg:ml-0' : 'lg:ml-0'}
              h-[calc(100vh-3.5rem)] mt-10 lg:mt-0
            `}>
              {!isSidebarVisible && (
                <Button 
                  variant="outline" 
                  size="icon"
                  className="mb-4 hidden lg:flex"
                  onClick={() => setIsSidebarVisible(true)}
                >
                  <ChevronLeftIcon />
                </Button>
              )}
              <Card className="p-2 sm:p-4 w-full">
                <div className="space-y-2 sm:space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-3">Lista de Palavras-chave</h2>
                    <div className="relative">
                      <Textarea 
                        value={generatedContent.keywords} 
                        readOnly 
                        className="pr-10 min-h-[150px] w-full"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={() => handleCopy(generatedContent.keywords)}
                      >
                        <CopyIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-3">Palavras-chave dos Concorrentes</h2>
                    <div className="relative">
                      <Textarea 
                        value={generatedContent.scrapedKeywords.join(', ')} 
                        readOnly 
                        className="pr-10 min-h-[150px] w-full"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={() => handleCopy(generatedContent.scrapedKeywords.join(', '))}
                      >
                        <CopyIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-3">Headlines (Títulos Curtos)</h2>
                    {generatedContent.headlines.map((headline, index) => (
                      <div key={index} className="relative mb-2">
                        <Input 
                          value={headline} 
                          readOnly 
                          className="pr-10"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          onClick={() => handleCopy(headline)}
                        >
                          <CopyIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  {userInput.campaignType === 'pmax' && (
                    <div>
                      <h2 className="text-xl font-semibold mb-3">Títulos Longos</h2>
                      {generatedContent.longTitles.map((title, index) => (
                        <div key={index} className="relative mb-2">
                          <Input 
                            value={title} 
                            readOnly 
                            className="pr-10"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2"
                            onClick={() => handleCopy(title)}
                          >
                            <CopyIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-semibold mb-3">Descrições</h2>
                    {generatedContent.descriptions.map((description, index) => (
                      <div key={index} className="relative mb-2">
                        <Input 
                          value={description} 
                          readOnly 
                          className="pr-10"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          onClick={() => handleCopy(description)}
                        >
                          <CopyIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleExportCSV} className="w-full">
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Exportar para CSV
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}
        {activeMenu === 'historico' && (
          <div className="flex-1 p-2 sm:p-4 overflow-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Histórico de Anúncios</h2>
            {/* Implementar a lógica do histórico de anúncios aqui */}
          </div>
        )}
        {activeMenu === 'testes' && (
          <div className="flex-1 p-2 sm:p-4 overflow-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Testes A/B</h2>
            {/* Implementar a lógica dos testes A/B aqui */}
          </div>
        )}
        {activeMenu === 'palavras' && (
          <div className="flex-1 p-2 sm:p-4 overflow-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Gerenciamento de Palavras-Chave</h2>
            {/* Implementar a lógica de gerenciamento de palavras-chave aqui */}
          </div>
        )}
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
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
import Head from 'next/head'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <Head />
      <body>
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  )
}


type CampaignType = 'search' | 'pmax'

interface UserInput {
  campaignType: CampaignType;
  language: string;
  tone: string;
  description: string;
  target: string;
  differentials: string;
  finalUrl: string;
  competitors: string;
  ctaCategory: string;
  cta: string;
}

export function AdCopyCreatorComponent() {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSidebarVisible, setIsSidebarVisible] = useState(true)
  const [userInput, setUserInput] = useState<UserInput>({
    campaignType: 'search',
    language: '',
    tone: '',
    description: '',
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
    scrapedKeywords: [], // Adicione esta linha
  })
  const [ctaOptions, setCTAOptions] = useState<string[]>([]);

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
      const response = await fetch('/api/generate-ad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userInput),
      })

      if (!response.ok) {
        throw new Error('Falha na geração do anúncio')
      }

      const data = await response.json()
      setGeneratedContent({
        keywords: data.keywords,
        headlines: data.headlines,
        longTitles: data.longTitles,
        descriptions: data.descriptions,
        scrapedKeywords: data.scrapedKeywords, // Adicione esta linha
      })
      toast({
        title: "Sucesso!",
        description: "O anúncio foi gerado com sucesso.",
      })
    } catch (error) {
      console.error('Erro ao gerar o anúncio:', error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao gerar o anúncio. Por favor, tente novamente.",
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

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background">
      <div 
        className={`fixed lg:relative top-0 left-0 h-full bg-background z-10 transition-all duration-300 ease-in-out ${
          isSidebarVisible ? 'w-full lg:w-80' : 'w-0 overflow-hidden'
        }`}
      >
        <div className="p-4 w-full lg:w-80">
          <div className="flex justify-between items-center mb-4 lg:hidden">
            <h2 className="text-lg font-semibold">Configurações</h2>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setIsSidebarVisible(false)}
            >
              <ChevronLeftIcon />
            </Button>
          </div>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleGenerate(); }}>
            <h3 className="font-semibold">Campos Obrigatórios</h3>
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
            <div>
              <Label htmlFor="language">Idioma</Label>
              <Input id="language" value={userInput.language} onChange={handleInputChange} placeholder="Idioma" required />
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
            <Button type="submit" disabled={isGenerating}>
              {isGenerating ? 'Gerando...' : 'Gerar Anúncio'}
            </Button>
          </form>
        </div>
      </div>
      <div className={`flex-1 p-4 transition-all duration-300 ease-in-out ${isSidebarVisible ? 'lg:ml-0' : 'ml-0'}`}>
        <Button 
          variant="outline" 
          size="icon"
          className="mb-4"
          onClick={() => setIsSidebarVisible(!isSidebarVisible)}
        >
          {isSidebarVisible ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </Button>
        <Card className="p-4">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Lista de Palavras Chaves</h2>
              <div className="relative">
                <Textarea value={generatedContent.keywords} readOnly className="pr-10" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => handleCopy(generatedContent.keywords)}
                >
                  <CopyIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Palavras-chave dos Concorrentes</h2>
              <div className="relative">
                <Textarea value={generatedContent.scrapedKeywords.join(', ')} readOnly className="pr-10" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => handleCopy(generatedContent.scrapedKeywords.join(', '))}
                >
                  <CopyIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Headlines (Títulos Curtos)</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {generatedContent.headlines.map((headline, index) => {
                  const { text, count, spaces, special } = cleanAndCountCharacters(headline, 30);
                  return (
                    <div key={index} className="relative">
                      <Input 
                        value={text} 
                        readOnly 
                        className="pr-10"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={() => handleCopy(text)}
                      >
                        <CopyIcon className="h-4 w-4" />
                      </Button>
                      <div className="mt-1">
                        <Progress value={getProgressPercentage(count, 30)} className="h-1" />
                        <span className="text-xs text-gray-500">
                          {count}/30 (Espaços: {spaces}, Especiais: {special})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {userInput.campaignType === 'pmax' && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Títulos Longos</h2>
                <div className="space-y-2">
                  {generatedContent.longTitles.map((title, index) => {
                    const { text, count, spaces, special } = cleanAndCountCharacters(title, 90);
                    return (
                      <div key={index} className="relative">
                        <Input value={text} readOnly className="pr-10" />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          onClick={() => handleCopy(text)}
                        >
                          <CopyIcon className="h-4 w-4" />
                        </Button>
                        <div className="mt-1">
                          <Progress value={getProgressPercentage(count, 90)} className="h-1" />
                          <span className="text-xs text-gray-500">
                            {count}/90 (Espaços: {spaces}, Especiais: {special})
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold mb-2">Descrições</h2>
              <div className="space-y-2">
                {generatedContent.descriptions.map((description, index) => (
                  <div key={index} className="relative">
                    <Textarea value={description} readOnly className="pr-10" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => handleCopy(description)}
                    >
                      <CopyIcon className="h-4 w-4" />
                    </Button>
                    <div className="mt-1">
                      <Progress value={getProgressPercentage(getCharacterCount(description), 90)} className="h-1" />
                      <span className="text-xs text-gray-500">{getCharacterCount(description)}/90</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={handleExportCSV} className="w-full">
              <DownloadIcon className="h-4 w-4 mr-2" />
              Exportar para CSV
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
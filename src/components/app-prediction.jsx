import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Check, ChevronsUpDown, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { cities } from "@/data/cities.json"
import { Calendar as CalendarPicker } from "@/components/ui/calendar"
import { format } from "date-fns"
import { useState } from "react"
import TableData from "./table-data"

const formSchema = z.object({
    city: z.string().min(1, "Please select a city."),
    item: z.string().min(1, "Please select a item."),
    date: z.date({ required_error: "Please select a date." }),
})

export default function PredictionPage() {
    // Estado para almacenar los datos de la tabla
    const [tableData, setTableData] = useState();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: { city: "", date: undefined },
    })
    const [open, setOpen] = useState(false)
    const [cityItems, setCityItems] = useState([]);
    const [openItems, setOpenItems] = useState(false);

    function onSubmit(values) {
        const formattedData = {
            ...values,
            date: values.date ? format(values.date, "yyyy-MM-dd") : null,
        }
        setTableData(formattedData)
        // console.log(formattedData)
    }

    return (
        <div className="flex justify-center bg-gray-200 h-full">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="mt-10 mx-10">
                    {/* City Selector */}
                    <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>City</FormLabel>
                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={open}
                                            className="w-[350px] justify-between"
                                        >
                                            {field.value
                                                ? cities.find((city) => city.name === field.value)?.name
                                                : "Select city..."}
                                            <ChevronsUpDown className="opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0">
                                        <Command>
                                            <CommandInput placeholder="Search city..." className="h-9" />
                                            <CommandList>
                                                <CommandEmpty>No city found.</CommandEmpty>
                                                <CommandGroup>
                                                    {cities.map((city) => (
                                                        <CommandItem
                                                            key={city.name}
                                                            value={city.name}
                                                            onSelect={(currentValue) => {
                                                                field.onChange(currentValue === field.value ? "" : currentValue)
                                                                setOpen(false)
                                                                // Update items when city changes
                                                                const selectedCity = cities.find((c) => c.name === currentValue)
                                                                if (selectedCity) {
                                                                    setCityItems(selectedCity.items)
                                                                    // Reset items field when city changes
                                                                    form.setValue("item", "")
                                                                } else {
                                                                    setCityItems([])
                                                                }
                                                            }}
                                                        >
                                                            {city.name}
                                                            <Check
                                                                className={cn(
                                                                    "ml-auto",
                                                                    field.value === city.name ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <div className="min-h-[20px]">
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />
                    {/* Items Selector */}

                    <FormField
                        control={form.control}
                        name="item"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Items</FormLabel>
                                <Popover open={openItems} onOpenChange={setOpenItems}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openItems}
                                            className="w-[350px] justify-between"
                                        >
                                            {field.value
                                                ? cityItems.find((item) => item === field.value)
                                                : "Select item..."}
                                            <ChevronsUpDown className="opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[350px] p-0">
                                        <Command>
                                            <CommandInput placeholder="Search item..." className="h-9" />
                                            <CommandList>
                                                <CommandEmpty>No item found.</CommandEmpty>
                                                <CommandGroup>
                                                    {cityItems.map((item) => (
                                                        <CommandItem
                                                            key={item}
                                                            value={item}
                                                            onSelect={(currentValue) => {
                                                                field.onChange(currentValue === field.value ? "" : currentValue)
                                                                setOpenItems(false)
                                                            }}
                                                        >
                                                            {item}
                                                            <Check
                                                                className={cn(
                                                                    "ml-auto",
                                                                    field.value === item ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <div className="min-h-[20px]">
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />

                    {/* Date Picker */}
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-[350px] justify-between">
                                            {field.value ? format(field.value, "PPP") : "Pick a date"}
                                            <Calendar className="opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent align="start" className="w-auto p-0">
                                        <CalendarPicker
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => {
                                                const today = new Date();
                                                // Bloquear fechas futuras
                                                if (date > today) return true;
                                                // Bloquear días que no sean lunes (Monday = 1)
                                                return date.getDay() !== 1;
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <div className="min-h-[20px]">
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />

                    {/* Botón de envío */}
                    <div className="">
                        <Button type="submit">Generate Data</Button>
                    </div>
                </form>
            </Form>
            {/* Pasar los datos a la tabla */}
            <div className="flex-1">
            <TableData key={JSON.stringify(tableData)} data={tableData} />
            </div>
        </div>
    )
}

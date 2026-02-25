import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface DateTimePickerProps {
    date?: Date;
    setDate: (date: Date | undefined) => void;
    label?: string;
    minDate?: Date;
}

export function DateTimePicker({ date, setDate, label, minDate }: DateTimePickerProps) {
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date);

    // Update internal state when external date changes
    React.useEffect(() => {
        setSelectedDate(date);
    }, [date]);

    const handleDateSelect = (newDate: Date | undefined) => {
        if (!newDate) return;

        // Preserve the time from the previous date if available
        const hours = selectedDate ? selectedDate.getHours() : 12;
        const minutes = selectedDate ? selectedDate.getMinutes() : 0;

        const updatedDate = new Date(newDate);
        updatedDate.setHours(hours);
        updatedDate.setMinutes(minutes);
        updatedDate.setSeconds(0);
        updatedDate.setMilliseconds(0);

        setSelectedDate(updatedDate);
        setDate(updatedDate);
    };

    const handleTimeChange = (type: "hours" | "minutes", value: string) => {
        const updatedDate = selectedDate ? new Date(selectedDate) : new Date();
        if (type === "hours") {
            updatedDate.setHours(parseInt(value, 10));
        } else {
            updatedDate.setMinutes(parseInt(value, 10));
        }
        updatedDate.setSeconds(0);
        updatedDate.setMilliseconds(0);

        setSelectedDate(updatedDate);
        setDate(updatedDate);
    };

    return (
        <div className="grid gap-2">
            {label && <span className="text-sm font-medium">{label}</span>}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-normal h-11 px-3",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4 text-accent" />
                        {date ? format(date, "PPP p") : <span>Pick date and time</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        initialFocus
                        disabled={(d) => (minDate ? d < new Date(minDate.setHours(0, 0, 0, 0)) : false)}
                    />
                    <div className="p-3 border-t border-border flex items-center justify-between gap-2 bg-secondary/20">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-medium">Time</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Select
                                value={selectedDate?.getHours().toString()}
                                onValueChange={(v) => handleTimeChange("hours", v)}
                            >
                                <SelectTrigger className="h-8 w-[65px] text-xs">
                                    <SelectValue placeholder="HH" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 24 }).map((_, i) => (
                                        <SelectItem key={i} value={i.toString()}>
                                            {i.toString().padStart(2, "0")}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <span className="text-muted-foreground">:</span>
                            <Select
                                value={selectedDate?.getMinutes().toString()}
                                onValueChange={(v) => handleTimeChange("minutes", v)}
                            >
                                <SelectTrigger className="h-8 w-[65px] text-xs">
                                    <SelectValue placeholder="MM" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 12 }).map((_, i) => (
                                        <SelectItem key={i} value={(i * 5).toString()}>
                                            {(i * 5).toString().padStart(2, "0")}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CalendarProps {
    onSelect: (datetime: string) => void;
    selectedDateTime: string;
}

export default function Calendar({ onSelect, selectedDateTime }: CalendarProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedDate, setSelectedDate] = useState<Date | null>(
        selectedDateTime ? new Date(selectedDateTime) : null
    );

    const today = new Date();
    const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const handleDateClick = (day: number) => {
        const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        setSelectedDate(date);
        setStep(2);
    };

    const handleTimeClick = (time: string) => {
        if (!selectedDate) return;
        const [hours, minutes] = time.split(":").map(Number);
        const date = new Date(selectedDate);
        date.setHours(hours, minutes);
        onSelect(date.toISOString());
    };

    const formattedSelected = selectedDateTime
        ? new Intl.DateTimeFormat('en-US', {
            month: 'long', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: false
        }).format(new Date(selectedDateTime)).replace(',', ' at')
        : "No date selected yet";

    return (
        <div className="w-full space-y-6">
            {/* Selection Summary */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex items-center justify-between group transition-all hover:bg-white/[0.05]">
                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-primary">Selected Slot</p>
                    <p className="text-sm font-bold text-white/90">{formattedSelected}</p>
                </div>
                {selectedDateTime && (
                    <button
                        type="button"
                        onClick={() => { setStep(1); }}
                        className="text-[10px] font-black text-white/20 hover:text-white/60 uppercase tracking-widest transition-colors mr-2"
                    >
                        Reset
                    </button>
                )}
            </div>

            <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.3em] ml-2">
                <span className={step === 1 ? "text-white" : "text-white/10"}>01. Date</span>
                <span className="text-white/5 hover:text-white/10">—————</span>
                <span className={step === 2 ? "text-white" : "text-white/10"}>02. Time</span>
            </div>

            <div className="bg-white/[0.01] border border-white/5 rounded-[3rem] p-8 shadow-inner relative overflow-hidden">
                {/* Subtle glow background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/5 blur-[60px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 blur-[60px] pointer-events-none" />

                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-8"
                        >
                            <div className="flex items-center justify-between px-2">
                                <button
                                    type="button"
                                    onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                                    className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5"
                                >
                                    <i className="ri-arrow-left-s-line text-2xl text-white/40" />
                                </button>
                                <div className="text-center">
                                    <h3 className="text-lg font-black tracking-tighter uppercase whitespace-nowrap">
                                        {months[viewDate.getMonth()]} {viewDate.getFullYear()}
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                                    className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5"
                                >
                                    <i className="ri-arrow-right-s-line text-2xl text-white/40" />
                                </button>
                            </div>

                            <div className="grid grid-cols-7 gap-y-3 gap-x-1">
                                {["S", "M", "T", "W", "T", "F", "S"].map(day => (
                                    <div key={day} className="text-center text-[10px] font-black text-white/10 uppercase mb-4">
                                        {day}
                                    </div>
                                ))}

                                {Array.from({ length: firstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth()) }).map((_, i) => (
                                    <div key={`empty-${i}`} />
                                ))}

                                {Array.from({ length: daysInMonth(viewDate.getFullYear(), viewDate.getMonth()) }).map((_, i) => {
                                    const day = i + 1;
                                    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                                    const isToday = today.getDate() === day && today.getMonth() === viewDate.getMonth() && today.getFullYear() === viewDate.getFullYear();
                                    const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === viewDate.getMonth() && selectedDate?.getFullYear() === viewDate.getFullYear();
                                    const isPast = d < new Date(today.getFullYear(), today.getMonth(), today.getDate());

                                    return (
                                        <button
                                            key={day}
                                            type="button"
                                            disabled={isPast}
                                            onClick={() => handleDateClick(day)}
                                            className={`relative aspect-square rounded-2xl flex items-center justify-center text-sm font-black transition-all group ${isPast ? "opacity-5 cursor-not-allowed" :
                                                    isSelected ? "bg-white text-black shadow-3xl scale-110" : "hover:bg-white/5 text-white/50 hover:text-white"
                                                }`}
                                        >
                                            {isToday && !isSelected && (
                                                <div className="absolute inset-2 border-2 border-accent-primary/30 rounded-xl" />
                                            )}
                                            <span className="relative z-10">{day}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, scale: 1.02 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-8"
                        >
                            <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-2">
                                <div>
                                    <h3 className="text-xl font-black tracking-tighter uppercase whitespace-nowrap">Choose a Slot</h3>
                                    <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mt-1">Available 30min windows</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5"
                                >
                                    <i className="ri-close-line text-lg text-white/30" />
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                {["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"].map(time => {
                                    const h = parseInt(time.split(":")[0]);
                                    const m = parseInt(time.split(":")[1]);
                                    const isSelected = selectedDateTime &&
                                        new Date(selectedDateTime).getHours() === h &&
                                        new Date(selectedDateTime).getMinutes() === m &&
                                        new Date(selectedDateTime).getDate() === selectedDate?.getDate();

                                    return (
                                        <button
                                            key={time}
                                            type="button"
                                            onClick={() => handleTimeClick(time)}
                                            className={`py-4 rounded-2xl text-xs font-black border transition-all duration-300 ${isSelected
                                                    ? "bg-accent-primary text-black border-accent-primary shadow-[0_10px_30px_rgba(245,158,11,0.3)] scale-105"
                                                    : "bg-white/[0.03] border-white/5 text-white/40 hover:bg-white/[0.08] hover:border-white/10 hover:text-white"
                                                }`}
                                        >
                                            {time}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="group flex items-center gap-2 text-[10px] font-black text-white/20 hover:text-white/60 uppercase tracking-[0.2em] transition-all"
                                >
                                    <i className="ri-arrow-left-line transition-transform group-hover:-translate-x-1" />
                                    Back to Calendar
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

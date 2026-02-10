import React from 'react';

const memories = [
    {
        rotation: 'rotate-[-1.5deg]',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDILwAmJL1zePBDo_Rz2DagIfakK0Nt3rnvVeDzKSdinLloyLKJy6VTKHKLUaSA4C8PkRfvr5W-T1HSB5oT28EakboZ74GEuXFNt3mtkEybpS7RNW4K-Cb9vbfHzvWW7_wxcXM32DDQdkXvQVUNe7dybxLoFHq6uFwFR6_PazbRLcMkGjFVBdAvvITdCTdcYeDXfMUuaQBDZXAJfnQXO9yzjRdQl8tGgJgpNFMOQV7IUdKnkAW4uQp97Bm-W1kU5FXU1vK79DQtOyE',
        caption: '"Aquel verano eterno"',
        margin: '',
    },
    {
        rotation: 'rotate-[2deg]',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1NoJRnb6_EWRV8opWXCi19h98Vs1UcNHq7n1MMTg0QcGUCzAEjgQq_UlUTcmbIHkHT_tfvkbKMTZlyWgsw-qiPvl5DZZyIHiZDiDR4NFKOQ9BtFkoWpxCO-WDcbEP2S_49ivaHqWMR2FFvqXwWizKKqQAbX9wS-p_6DWwrS-xviKq3UUeH0WRYq2X-jBPKN-9iue921rlt5sLHH3ZU2uS4gO1vxnsKKvcC479YufjIPNC3YwN4pV2K3ArnY2qcbAdIewzoR5x-34',
        caption: '"Sabiduría en silencio"',
        margin: 'mt-4',
    },
    {
        rotation: 'rotate-[-1deg]',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_7xO6jcb_YXrIzVbTsZ_2RhBLBDhbdqsjTaFsH0uaGaS9Aw_g76uzZQczLEELaYjfl9YLSjzYftOu2QKy2WbmWyOHwGGMQmzGBd7nZPLf-bU1b0rqEqshz_eHZRPUekyU6I3BbSFWwAmnFRl379n7lr3ux9selqdrdpWATp8A0Pborq_YXdNMwd7bKnLGd3EVQEReZHJK0CPnjS7K0kc0lFyjxWOiT6hJrq9Bwj-DEksVGFENe-n--o1uMpAOFnKw3X-d6h04Se4',
        caption: '"La promesa de volver"',
        margin: 'mt-2',
    },
];

export function MemoryGallery() {
    return (
        <section className="py-20 overflow-hidden">
            <div className="px-6 mb-12 max-w-6xl mx-auto">
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary mb-3 block">Recuerdos</span>
                <h2 className="text-3xl font-display font-light italic text-charcoal">Historias que perduran</h2>
            </div>

            {/* Horizontal Scroll Container */}
            <div className="flex overflow-x-auto gap-6 px-6 pb-10 scrollbar-hide snap-x snap-mandatory max-w-6xl mx-auto">
                {memories.map((item, index) => (
                    <div key={index} className={`flex-none w-72 scroll-item snap-center ${item.rotation} ${item.margin}`}>
                        <div className="bg-white p-4 pb-12 rounded-sm shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-gray-100">
                            <div className="aspect-[4/5] bg-gray-100 overflow-hidden rounded-[2px]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    alt={item.caption}
                                    className="w-full h-full object-cover grayscale-[10%]"
                                    src={item.img}
                                />
                            </div>
                            <div className="mt-8 font-display italic text-charcoal/50 text-base text-center">
                                {item.caption}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

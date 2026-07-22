import React, { useState } from "react";
import { ShoppingCart, Star, Coins, Gem } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useShop } from "@/hooks/useShop";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";

export const ShopSection = ({ group = false, gem = false }: { group?: boolean, gem?: boolean }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [newItemAvatar, setNewItemAvatar] = useState("👔");
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState(1);
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState(1)
  const { profile } = useProfile();
  const {
    shopItems,
    purchaseItem,
    isPurchasing,
    createSingle,
    treasureBalance,

  } = useShop(profile?.team_id || undefined, group, gem);
  const { toast } = useToast();

  const handlePurchase = async (item: any) => {
    try {
      await purchaseItem({
        itemId: item.id,
        itemName: item.title,
        cost: item.price,
      });


      toast({
        title: "УСПЕХ",
        description: `ВЫ ПРИОБРЕЛИ "${item.title.toUpperCase()}"!`,
      });
    } catch (error) {
      console.error("Ошибка покупки:", error);
      toast({
        title: "ОШИБКА",
        description:
          error instanceof Error
            ? error.message.toUpperCase()
            : "НЕ УДАЛОСЬ СОВЕРШИТЬ ПОКУПКУ",
        variant: "destructive",
      });
    }
  };

  const handleCreate = async () => {
    try {
      await createSingle({
        avatar: newItemAvatar,
        title: newItemName,
        price: newItemPrice,
        description: newItemDescription,
        quantity: newItemQuantity
      });
      setOpen(false);
    } catch (error) {
      console.error("Ошибка создания предмета:", error);
      toast({
        title: "ОШИБКА",
        description:
          error instanceof Error
            ? error.message.toUpperCase()
            : "НЕ УДАЛОСЬ СОЗДАТЬ ПРЕДМЕТ",
        variant: "destructive",
      });
    }
  };

  const onCreateSinglePress = () => {
    setOpen(true);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "clothing":
        return "👔";
      case "accessories":
        return "💼";
      default:
        return "🛍️";
    }
  };

  const canAfford = (cost: number) =>
    gem ? (profile?.crystalls || 0) >= cost :
    group
      ? (Number(treasureBalance) || 0) >= cost
      : (profile?.points || 0) >= cost;

  return (
    <div className="space-y-8">
      {/* Заголовок магазина */}
      <div className="vice-card p-8 relative overflow-hidden">
        <div className="absolute inset-0 border-2 border-purple-400/30 rounded-lg pointer-events-none"></div>

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 vice-gradient rounded-full flex items-center justify-center border-2 border-purple-400 neon-glow">
              <ShoppingCart className="text-white" size={32} />
            </div>
            <div>
              <h2 className="text-4xl font-bold font-mono tracking-wider text-transparent bg-clip-text vice-gradient neon-text mb-2">
                {group ? "МАГАЗИН КОМАНДЫ" : "МАГАЗИН"}
              </h2>
              <p className="text-purple-300 font-mono text-lg tracking-wide">
                ОБМЕНИВАЙТЕ БАЛЛЫ НА ПРЕСТИЖНЫЕ ТОВАРЫ
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 text-3xl font-bold font-mono text-green-400 neon-text">
              {gem ? <Gem className="text-cyan-400" size={32} /> : <Coins className="text-yellow-400" size={32} />}
              <span>
                {group
                  ? Number(treasureBalance) || 0
                  : gem ? profile?.crystalls?.toLocaleString() || 0 : profile?.points?.toLocaleString() || 0}
              </span>
            </div>
            <p className="text-cyan-300 font-mono text-sm tracking-wider">
              {gem ? "ВАШИ КРИСТАЛЛЫ" : "ВАШИ БАЛЛЫ"}
            </p>
          </div>
        </div>
      </div>
      {profile?.role === "leader" && (
        <Button
          onClick={onCreateSinglePress}
          className="vice-button font-mono tracking-wider"
        >
          ДОБАВИТЬ ТОВАР
        </Button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] bg-gray-900 border-cyan-400/30">
          <DialogHeader>
            <DialogTitle className="text-2xl font-mono tracking-wider text-transparent bg-clip-text vice-gradient flex items-center">
              ДОБАВИТЬ ПРЕДМЕТ
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-mono text-green-300 mb-2">
                АВАТАР
              </label>
              <Input
                value={newItemAvatar}
                onChange={(e) => setNewItemAvatar(e.target.value)}
                placeholder="Впишите сюда эмодзи"
                className="bg-gray-800 border border-green-500/30 text-cyan-300 font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-mono text-green-300 mb-2">
                НАЗВАНИЕ
              </label>
              <Input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Введите название предмета"
                className="bg-gray-800 border border-green-500/30 text-cyan-300 font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-mono text-green-300 mb-2">
                СУММА ($)
              </label>
              <Input
                type="number"
                min="1"
                step="1"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(Number(e.target.value))}
                placeholder="Введите сумму в долларах"
                className="bg-gray-800 border border-green-500/30 text-cyan-300 font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-mono text-green-300 mb-2">
                ОПИСАНИЕ
              </label>
              <Input
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
                placeholder="Введите описание предмета"
                className="bg-gray-800 border border-green-500/30 text-cyan-300 font-mono"
              />
            </div>
               <div>
              <label className="block text-sm font-mono text-green-300 mb-2">
                КОЛИЧЕСТВО
              </label>
              <Input
                value={newItemQuantity}
                type='number'
                onChange={(e) => setNewItemQuantity(Number(e.target.value))}
                placeholder="Введите количество доступных предметов"
                className="bg-gray-800 border border-green-500/30 text-cyan-300 font-mono"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                onClick={handleCreate}
                disabled={
                  newItemName.length === 0 ||
                  newItemDescription.length === 0 ||
                  newItemAvatar.length === 0 ||
                  newItemPrice === 0
                }
                className="w-full bg-gradient-to-r from-green-600 to-emerald-800 border border-green-400 font-mono font-bold"
              >
                ДОБАВИТЬ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Товары */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shopItems?.map((item) => {
          const affordable = canAfford(item?.price);

          return (
            <Card
              key={item.id}
              className={`vice-card border relative overflow-hidden transition-all duration-300 hover:scale-105 ${
                affordable
                  ? "border-green-400/50 hover:neon-glow-green"
                  : "border-red-400/50 hover:border-red-400/70"
              }`}
            >
              <div className="absolute inset-0 vice-gradient opacity-5"></div>

              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{item?.avatar}</span>
                  <div className="flex items-center space-x-1">
                    <Star className="text-yellow-400" size={16} />
                    <Star className="text-yellow-400" size={16} />
                    <Star className="text-yellow-400" size={16} />
                  </div>
                </div>
                <CardTitle className="font-mono tracking-wider text-transparent bg-clip-text vice-gradient">
                  {item?.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="relative z-10 space-y-4">
                <p className="text-cyan-300 font-mono text-sm">
                  {item?.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {gem ? <Gem className="text-cyan-400" size={20} /> : <Coins className="text-yellow-400" size={20} />}
                    <span className="font-bold text-2xl font-mono text-green-400">
                      {item?.price?.toLocaleString()}
                    </span>
                  </div>

                  <Button
                    onClick={() => handlePurchase(item)}
                    disabled={!affordable || isPurchasing || !user || !item?.quantity}
                    className={`font-mono font-bold tracking-wider transition-all duration-300 ${
                      affordable && user
                        ? "vice-button text-white hover:scale-105"
                        : "bg-gray-600 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {!user
                      ? "ВОЙДИТЕ"
                      : !affordable
                      ? "НЕ ХВАТАЕТ"
                      : isPurchasing
                      ? "ПОКУПКА..."
                      : "КУПИТЬ"}
                  </Button>
                </div>

                {!affordable && user && (
                  <p className="text-red-400 font-mono text-xs text-center">
                    НУЖНО ЕЩЕ{" "}
                    {
                    gem ? (item?.price - (profile?.crystalls || 0)).toLocaleString() :
                    group
                      ? (item?.price - (treasureBalance || 0)).toLocaleString()
                      : (
                          item?.price - (profile?.points || 0)
                        ).toLocaleString()}{" "}
                    БАЛЛОВ
                  </p>
                )}
                 <p className={`text-${!!item?.quantity && item?.quantity > 0 ? "white" : "red"}-400 font-mono text-xs text-center`}>
                    {item?.quantity && item?.quantity > 0 ? `ОСТАЛОСЬ ${item?.quantity}` : "НЕТ В НАЛИЧИИ"}
                  </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

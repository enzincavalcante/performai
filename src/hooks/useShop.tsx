import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useTeamNotifications } from "./useTeamNotifications";
import { toast } from "./use-toast";

interface ShopItem {
  id: string;
  name: string;
  cost: number;
  description: string;
  category: string;
}

export const useShop = (teamId?: string, group?: boolean, gem?: boolean) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { sendNotification } = useTeamNotifications(teamId || "");
  console.log("group", group);
  const {
    data: shopItems,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      gem ? "gem_shop_items" : group ? "group_shop_items" : "single_shop_items",
    ],
    queryFn: async () => {
      if (gem) {
        const { data, error } = await supabase
          .from("gem_shop_items")
          .select("*")
          .order("price", { ascending: true });

        if (error) throw error;
        return data || [];
      }
      if (group) {
        const { data, error } = await supabase
          .from("group_shop_items")
          .select("*")
          .order("price", { ascending: true });

        if (error) throw error;
        return data || [];
      }

      const { data, error } = await supabase
        .from("single_shop_items")
        .select("*")
        .order("price", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const createSingleMutation = useMutation({
    mutationFn: async ({
      title,
      price,
      description,
      avatar,
      quantity,
    }: {
      title: string;
      price: number;
      description: string;
      avatar: string;
      quantity: number;
    }) => {
      if (!user?.id) throw new Error("Пользователь не авторизован");
      if (gem) {
        const { error } = await supabase.from("gem_shop_items").insert({
          title,
          price,
          description,
          avatar,
          quantity,
        });

        if (error) throw error;
        return;
      }
      if (group) {
        const { error } = await supabase.from("group_shop_items").insert({
          title,
          price,
          description,
          avatar,
          quantity,
        });

        if (error) throw error;
        return;
      }

      const { error } = await supabase.from("single_shop_items").insert({
        title,
        price,
        description,
        avatar,
        quantity,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["single_shop_items"]);
      queryClient.invalidateQueries(["group_shop_items"]);
      queryClient.invalidateQueries(["gem_shop_items"]);
    },
    onError: (error) => {
      console.error("Ошибка создания предмета:", error);
      toast({
        title: "ОШИБКА",
        description:
          error instanceof Error
            ? error.message.toUpperCase()
            : "НЕ УДАЛОСЬ СОЗДАТЬ ПРЕДМЕТ",
        variant: "destructive",
      });
    },
  });

  const purchaseItemMutation = useMutation({
    mutationFn: async ({
      itemId,
      itemName,
      cost,
    }: {
      itemId: string;
      itemName: string;
      cost: number;
    }) => {
      if (!user?.id) throw new Error("Пользователь не авторизован");
      if (gem) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("crystalls, username, full_name, team_id")
          .eq("id", user.id)
          .single();
        if (profileError) throw profileError;

        const { data: purchaseItem, error: purchaseItemError } = await supabase
          .from("gem_shop_items")
          .select("*")
          .eq("id", itemId)
          .single();

        if (profile.crystalls < cost) {
          throw new Error("Недостаточно кристаллов для покупки");
        }

        if(purchaseItem?.quantity < 1) {
          throw new Error("Товара нет в наличии");
        }

        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            crystalls: profile.crystalls - cost,
          })
          .eq("id", user.id);
        if (updateError) throw updateError;

        const {error: updateItemError} = await supabase
          .from("gem_shop_items")
          .update({
            quantity: purchaseItem.quantity - 1
          })
          .eq("id", itemId);
        if (updateItemError) throw updateItemError;

        const { error } = await supabase.from("gem_shop_purchases").insert({
          user_id: user.id,
          item_id: itemId,
          item_name: itemName,
          item_cost: cost,
        });
        if (error) throw error;

        await sendNotification({
          message: `Пользователь ${profile.username} покупает ${itemName} за ${cost} кристаллов 💎`,
          type: "shop",
        });

        return;
      }
      if (group) {
        const { error } = await supabase.from("group_shop_purchases").insert({
          user_id: user.id,
          item_id: itemId,
          item_name: itemName,
          item_cost: cost,
        });
        if (error) throw error;
        const { error: getTeamError, data } = await supabase
          .from("teams")
          .select("*")
          .eq("id", teamId)
          .single();
        if (getTeamError) throw getTeamError;


        const { data: purchaseItem, error: purchaseItemError } = await supabase
          .from("group_shop_items")
          .select("*")
          .eq("id", itemId)
          .single();

        if(purchaseItem?.quantity < 1) {
          throw new Error("Товара нет в наличии");
        }

        if(purchaseItemError){
          throw purchaseItemError;
        };

        if(data.treasury_balance < cost) {
          throw new Error("Недостаточно баллов для покупки");
        }

        const { error: updateItemError } = await supabase
          .from("group_shop_items")
          .update({
            quantity: purchaseItem.quantity - 1,
          })
          .eq("id", itemId);
        if (updateItemError) throw updateItemError;

        const { error: teamError } = await supabase
          .from("teams")
          .update({
            treasury_balance: data.treasury_balance - cost,
          })
          .eq("id", teamId);
        if (teamError) throw teamError;
        await sendNotification({
          message: `Команда ${data.name} покупает ${itemName} за ${cost} баллов`,
          type: "shop",
        });

        return;
      }
      // Проверяем баланс пользователя
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("points, username, full_name, team_id")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      if (profile.points < cost)
        throw new Error("Недостаточно баллов для покупки");

      const { data: purchaseItem, error: purchaseItemError } = await supabase
        .from("single_shop_items")
        .select("*")
        .eq("id", itemId)
        .single();

      if(purchaseItem?.quantity < 1) {
        throw new Error("Товара нет в наличии");
      }

      if(purchaseItemError){
        throw purchaseItemError;
      }
      
      const { error: updateError } = await supabase.rpc(
        "update_user_points_and_rank",
        {
          user_id_param: user.id,
          points_to_add: -cost,
          transaction_type_param: "покупка",
          description_param: `Покупка: ${itemName}`,
        }
      );

      const { error: updateItemError } = await supabase
        .from("single_shop_items")
        .update({
          quantity: purchaseItem.quantity - 1,
        })
        .eq("id", itemId);

      if (updateError) throw updateError;

      // Записываем покупку
      const { error: purchaseError } = await supabase
        .from("shop_purchases")
        .insert({
          user_id: user.id,
          item_name: itemName,
          item_cost: cost,
        });

      if (purchaseError) throw purchaseError;

      // Отправляем уведомление в чат команды, если пользователь состоит в команде
      if (profile.team_id && teamId === profile.team_id) {
        const userName = profile.full_name || profile.username;
        await sendNotification({
          message: `💰 ${userName} приобрел "${itemName}" за ${cost} баллов!`,
          type: "purchase",
        });
      }

      return { success: true, newBalance: profile.points - cost };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["chat-messages", teamId] });
      queryClient.invalidateQueries({ queryKey: ["treasureBalance", teamId] });
      queryClient.invalidateQueries(["single_shop_items"]);
      queryClient.invalidateQueries(["group_shop_items"]);
      queryClient.invalidateQueries(["gem_shop_items"]);
    },
  });
  const treasureBalance = useQuery({
    queryKey: ["treasureBalance", teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("treasury_balance")
        .eq("id", teamId)
        .single();
      if (error) throw error;
      return data.treasury_balance;
    },
  });

  return {
    shopItems,
    purchaseItem: purchaseItemMutation.mutateAsync,
    isPurchasing: purchaseItemMutation.isPending,
    createSingle: createSingleMutation.mutateAsync,
    treasureBalance: treasureBalance.data,
  };
};

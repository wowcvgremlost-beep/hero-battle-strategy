import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { TOWNS } from '@/data/towns';
import { getSkillBonuses } from '@/data/skills';
import { toast } from 'sonner';
import { Users, Crown, Swords, Plus, LogOut, Zap, Trophy, Shield, MessageCircle, Send } from 'lucide-react';

interface Guild {
  id: string;
  name: string;
  description: string;
  leader_id: string;
  icon: string;
  level: number;
  experience: number;
  max_members: number;
}

interface GuildMember {
  id: string;
  guild_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

interface GuildRaid {
  id: string;
  guild_id: string;
  raid_name: string;
  raid_boss_power: number;
  total_damage: number;
  status: string;
  gold_reward: number;
  exp_reward: number;
}

interface RaidParticipant {
  id: string;
  raid_id: string;
  user_id: string;
  damage_dealt: number;
}

const RAID_BOSSES = [
  { name: '🐉 Древний Дракон', power: 2000, gold: 5000, exp: 500 },
  { name: '👹 Лорд Демонов', power: 5000, gold: 12000, exp: 1200 },
  { name: '💀 Король Личей', power: 8000, gold: 20000, exp: 2000 },
  { name: '🌋 Титан Огня', power: 15000, gold: 40000, exp: 4000 },
  { name: '🌑 Владыка Бездны', power: 30000, gold: 80000, exp: 8000 },
];

const GUILD_ICONS = ['⚔️', '🛡️', '🔥', '❄️', '⚡', '🌟', '💎', '🦅', '🐺', '🦁'];

const GuildScreen = () => {
  const { user, profile, army, heroSkills, updateGold, updateHeroStats } = useAuth();
  const [myGuild, setMyGuild] = useState<Guild | null>(null);
  const [myMembership, setMyMembership] = useState<GuildMember | null>(null);
  const [members, setMembers] = useState<GuildMember[]>([]);
  const [memberProfiles, setMemberProfiles] = useState<Record<string, any>>({});
  const [allGuilds, setAllGuilds] = useState<Guild[]>([]);
  const [activeRaid, setActiveRaid] = useState<GuildRaid | null>(null);
  const [raidParticipants, setRaidParticipants] = useState<RaidParticipant[]>([]);
  const [mode, setMode] = useState<'guild' | 'browse' | 'create'>('guild');
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newIcon, setNewIcon] = useState('⚔️');
  const [chatMessages, setChatMessages] = useState<{ id: string; user_id: string; message: string; created_at: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const town = TOWNS.find(t => t.id === profile?.town);
  const skillsMap: Record<string, number> = {};
  heroSkills.forEach(s => { skillsMap[s.skill_id] = s.skill_level; });
  const bonuses = getSkillBonuses(skillsMap);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  // Realtime subscription for raids and chat
  useEffect(() => {
    if (!myGuild) return;
    const channel = supabase
      .channel('guild-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guild_raids', filter: `guild_id=eq.${myGuild.id}` },
        () => loadActiveRaid(myGuild.id))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guild_raid_participants' },
        () => { if (activeRaid) loadRaidParticipants(activeRaid.id); })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'guild_messages', filter: `guild_id=eq.${myGuild.id}` },
        (payload) => {
          setChatMessages(prev => [...prev, payload.new as any]);
          setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [myGuild, activeRaid]);

  const loadData = async () => {
    if (!user) return;
    // Check membership
    const { data: mem } = await supabase.from('guild_members').select('*').eq('user_id', user.id).maybeSingle();
    setMyMembership(mem as GuildMember | null);
    if (mem) {
      const { data: guild } = await supabase.from('guilds').select('*').eq('id', (mem as any).guild_id).single();
      setMyGuild(guild as Guild | null);
      if (guild) {
        await loadMembers((guild as any).id);
        await loadActiveRaid((guild as any).id);
        await loadChatMessages((guild as any).id);
      }
      setMode('guild');
    } else {
      setMyGuild(null);
      setMode('browse');
      await loadAllGuilds();
    }
  };

  const loadMembers = async (guildId: string) => {
    const { data } = await supabase.from('guild_members').select('*').eq('guild_id', guildId);
    const mems = (data || []) as GuildMember[];
    setMembers(mems);
    // Load profiles for members
    if (mems.length > 0) {
      const userIds = mems.map(m => m.user_id);
      const { data: profiles } = await supabase.from('profiles').select('user_id, character_name, hero_level, town').in('user_id', userIds);
      const map: Record<string, any> = {};
      (profiles || []).forEach((p: any) => { map[p.user_id] = p; });
      setMemberProfiles(map);
    }
  };

  const loadActiveRaid = async (guildId: string) => {
    const { data } = await supabase.from('guild_raids').select('*').eq('guild_id', guildId).eq('status', 'active').order('created_at', { ascending: false }).limit(1).maybeSingle();
    setActiveRaid(data as GuildRaid | null);
    if (data) await loadRaidParticipants((data as any).id);
  };

  const loadRaidParticipants = async (raidId: string) => {
    const { data } = await supabase.from('guild_raid_participants').select('*').eq('raid_id', raidId);
    setRaidParticipants((data || []) as RaidParticipant[]);
  };

  const loadChatMessages = async (guildId: string) => {
    const { data } = await supabase.from('guild_messages').select('id, user_id, message, created_at')
      .eq('guild_id', guildId).order('created_at', { ascending: true }).limit(100);
    setChatMessages((data || []) as any[]);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 200);
  };

  const sendChatMessage = async () => {
    if (!user || !myGuild || !chatInput.trim() || sendingChat) return;
    setSendingChat(true);
    try {
      await supabase.from('guild_messages').insert({
        guild_id: myGuild.id, user_id: user.id, message: chatInput.trim(),
      });
      setChatInput('');
    } catch {
      toast.error('Ошибка отправки');
    } finally {
      setSendingChat(false);
    }
  };


    const { data } = await supabase.from('guilds').select('*').order('level', { ascending: false });
    setAllGuilds((data || []) as Guild[]);
  };

  const createGuild = async () => {
    if (!user || !newName.trim() || creating) return;
    setCreating(true);
    try {
      const { data, error } = await supabase.from('guilds').insert({
        name: newName.trim(), description: newDesc.trim(), leader_id: user.id, icon: newIcon,
      }).select().single();
      if (error) throw error;
      // Add leader as member
      await supabase.from('guild_members').insert({
        guild_id: (data as any).id, user_id: user.id, role: 'leader',
      });
      toast.success(`Гильдия "${newName}" создана!`);
      await loadData();
    } catch (err: any) {
      if (err.message?.includes('unique')) toast.error('Гильдия с таким именем уже существует');
      else toast.error(err.message || 'Ошибка создания');
    } finally {
      setCreating(false);
    }
  };

  const joinGuild = async (guildId: string) => {
    if (!user) return;
    try {
      // Check member count
      const { count } = await supabase.from('guild_members').select('id', { count: 'exact' }).eq('guild_id', guildId);
      const guild = allGuilds.find(g => g.id === guildId);
      if (guild && (count || 0) >= guild.max_members) {
        toast.error('Гильдия переполнена!');
        return;
      }
      await supabase.from('guild_members').insert({ guild_id: guildId, user_id: user.id, role: 'member' });
      toast.success('Вы вступили в гильдию!');
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Ошибка');
    }
  };

  const leaveGuild = async () => {
    if (!user || !myMembership) return;
    if (myGuild && myGuild.leader_id === user.id) {
      toast.error('Лидер не может покинуть гильдию. Сначала передайте лидерство или распустите.');
      return;
    }
    await supabase.from('guild_members').delete().eq('id', myMembership.id);
    toast.info('Вы покинули гильдию');
    await loadData();
  };

  const disbandGuild = async () => {
    if (!user || !myGuild || myGuild.leader_id !== user.id) return;
    await supabase.from('guilds').delete().eq('id', myGuild.id);
    toast.info('Гильдия распущена');
    await loadData();
  };

  const startRaid = async (bossIdx: number) => {
    if (!user || !myGuild || myGuild.leader_id !== user.id) return;
    if (activeRaid) {
      toast.error('Уже есть активный рейд!');
      return;
    }
    const boss = RAID_BOSSES[bossIdx];
    await supabase.from('guild_raids').insert({
      guild_id: myGuild.id, raid_name: boss.name, raid_boss_power: boss.power,
      gold_reward: boss.gold, exp_reward: boss.exp,
    });
    toast.success(`Рейд на ${boss.name} начат!`);
    await loadActiveRaid(myGuild.id);
  };

  const attackRaid = async () => {
    if (!user || !profile || !activeRaid || !town) return;
    // Calculate player damage
    const heroAttack = (profile.hero_attack || 1) + bonuses.bonusAttack;
    const armyPower = army.reduce((total, unit) => {
      const unitData = town.units.find(u => u.name === unit.unit_name);
      return total + (unitData ? unit.count * (unitData.attack + Math.floor(unitData.value / 10)) : 0);
    }, 0);
    const isCrit = Math.random() * 100 < bonuses.luckChance;
    const baseDmg = heroAttack * 5 + armyPower;
    const damage = Math.floor(baseDmg * (0.8 + Math.random() * 0.4) * (isCrit ? 2 : 1));

    // Check if already participated
    const existing = raidParticipants.find(p => p.user_id === user.id);
    if (existing) {
      await supabase.from('guild_raid_participants').update({
        damage_dealt: existing.damage_dealt + damage,
      }).eq('id', existing.id);
    } else {
      await supabase.from('guild_raid_participants').insert({
        raid_id: activeRaid.id, user_id: user.id, damage_dealt: damage,
      });
    }

    // Update total damage
    const newTotal = activeRaid.total_damage + damage;
    const updates: any = { total_damage: newTotal };
    
    if (newTotal >= activeRaid.raid_boss_power) {
      updates.status = 'completed';
      updates.completed_at = new Date().toISOString();
    }

    await supabase.from('guild_raids').update(updates).eq('id', activeRaid.id);

    if (isCrit) toast.success(`🍀 КРИТ! Вы нанесли ${damage} урона боссу!`);
    else toast.success(`Вы нанесли ${damage} урона боссу!`);

    // If raid completed, distribute rewards
    if (newTotal >= activeRaid.raid_boss_power) {
      const goldShare = Math.floor(activeRaid.gold_reward / Math.max(1, raidParticipants.length + (existing ? 0 : 1)));
      const expShare = Math.floor(activeRaid.exp_reward / Math.max(1, raidParticipants.length + (existing ? 0 : 1)));
      await updateGold((profile.gold || 0) + goldShare);
      await updateHeroStats({ hero_experience: (profile.hero_experience || 0) + expShare });
      toast.success(`🏆 Босс повержен! +${goldShare}💰 +${expShare}✨`);
    }

    await loadActiveRaid(myGuild!.id);
  };

  const isLeader = myGuild && user && myGuild.leader_id === user.id;

  // MY GUILD VIEW
  if (myGuild && mode === 'guild') {
    return (
      <div className="space-y-4">
        {/* Guild header */}
        <div className="rounded-xl border border-gold/20 bg-gradient-card p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{myGuild.icon}</span>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">{myGuild.name}</h3>
                <p className="text-[10px] text-muted-foreground">Ур. {myGuild.level} • {members.length}/{myGuild.max_members} участников</p>
              </div>
            </div>
            {isLeader && <Crown className="h-5 w-5 text-gold" />}
          </div>
          {myGuild.description && <p className="text-xs text-muted-foreground">{myGuild.description}</p>}
          <div className="flex gap-2 mt-3">
            {!isLeader && (
              <motion.button whileTap={{ scale: 0.95 }} onClick={leaveGuild}
                className="rounded-lg bg-secondary px-3 py-2 font-display text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                <LogOut className="h-3 w-3" /> Покинуть
              </motion.button>
            )}
            {isLeader && (
              <motion.button whileTap={{ scale: 0.95 }} onClick={disbandGuild}
                className="rounded-lg bg-destructive/20 px-3 py-2 font-display text-[10px] font-bold text-destructive flex items-center gap-1">
                Распустить
              </motion.button>
            )}
          </div>
        </div>

        {/* Active Raid */}
        <div className="rounded-xl border border-crimson/20 bg-gradient-card p-4 space-y-3">
          <h4 className="font-display text-sm font-bold text-crimson uppercase flex items-center gap-2">
            <Swords className="h-4 w-4" /> Рейд
          </h4>
          {activeRaid ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-bold text-foreground">{activeRaid.raid_name}</span>
                <span className="text-[10px] text-muted-foreground">
                  {activeRaid.status === 'completed' ? '✅ Завершён' : '🔴 Активен'}
                </span>
              </div>
              {/* HP Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">Урон нанесён</span>
                  <span className="text-crimson font-bold">
                    {activeRaid.total_damage.toLocaleString()} / {activeRaid.raid_boss_power.toLocaleString()}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-crimson to-gold"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (activeRaid.total_damage / activeRaid.raid_boss_power) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="text-[10px] text-muted-foreground">
                Награда: {activeRaid.gold_reward.toLocaleString()}💰 {activeRaid.exp_reward}✨ (делится поровну)
              </div>
              {/* Participants */}
              {raidParticipants.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase">Участники:</p>
                  {raidParticipants.sort((a, b) => b.damage_dealt - a.damage_dealt).map(p => (
                    <div key={p.id} className="flex justify-between text-[10px]">
                      <span className="text-foreground">{memberProfiles[p.user_id]?.character_name || 'Игрок'}</span>
                      <span className="text-crimson font-bold">{p.damage_dealt.toLocaleString()} урона</span>
                    </div>
                  ))}
                </div>
              )}
              {activeRaid.status === 'active' && (
                <motion.button whileTap={{ scale: 0.95 }} onClick={attackRaid}
                  className="w-full rounded-lg bg-gradient-crimson px-3 py-2.5 font-display text-xs font-bold text-accent-foreground flex items-center justify-center gap-1">
                  <Zap className="h-4 w-4" /> АТАКОВАТЬ БОССА
                </motion.button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-center">Нет активного рейда</p>
              {isLeader && (
                <div className="space-y-1.5">
                  <p className="text-[10px] text-muted-foreground uppercase">Начать рейд:</p>
                  {RAID_BOSSES.map((boss, i) => (
                    <motion.button key={i} whileTap={{ scale: 0.97 }} onClick={() => startRaid(i)}
                      className="w-full rounded-lg border border-border bg-secondary/50 p-2.5 text-left flex items-center justify-between">
                      <div>
                        <p className="font-display text-xs font-bold text-foreground">{boss.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          HP: {boss.power.toLocaleString()} | {boss.gold.toLocaleString()}💰 {boss.exp}✨
                        </p>
                      </div>
                      <Swords className="h-4 w-4 text-crimson" />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Members */}
        <div className="rounded-xl border border-border bg-gradient-card p-4 space-y-2">
          <h4 className="font-display text-sm font-bold text-foreground uppercase flex items-center gap-2">
            <Users className="h-4 w-4" /> Участники ({members.length})
          </h4>
          {members.map(m => {
            const p = memberProfiles[m.user_id];
            return (
              <div key={m.id} className="flex items-center justify-between rounded-lg bg-secondary/30 p-2">
                <div className="flex items-center gap-2">
                  {m.role === 'leader' && <Crown className="h-3 w-3 text-gold" />}
                  <span className="text-xs font-bold text-foreground">{p?.character_name || 'Игрок'}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>Ур. {p?.hero_level || 1}</span>
                  <span>{p?.town || ''}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // CREATE VIEW
  if (mode === 'create') {
    return (
      <div className="space-y-4">
        <h3 className="font-display text-lg font-bold text-gold">Создать гильдию</h3>
        <div className="rounded-xl border border-gold/20 bg-gradient-card p-4 space-y-3">
          <div>
            <label className="text-[10px] text-muted-foreground uppercase">Иконка</label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {GUILD_ICONS.map(icon => (
                <button key={icon} onClick={() => setNewIcon(icon)}
                  className={`text-2xl p-1.5 rounded-lg transition-all ${newIcon === icon ? 'bg-gold/20 ring-2 ring-gold' : 'bg-secondary'}`}>
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase">Название</label>
            <input value={newName} onChange={e => setNewName(e.target.value)} maxLength={30} placeholder="Название гильдии..."
              className="w-full mt-1 rounded-lg bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase">Описание</label>
            <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} maxLength={100} rows={2} placeholder="Опишите гильдию..."
              className="w-full mt-1 rounded-lg bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50 resize-none" />
          </div>
          <div className="flex gap-2">
            <motion.button whileTap={{ scale: 0.95 }} onClick={createGuild} disabled={!newName.trim() || creating}
              className="flex-1 rounded-lg bg-gradient-gold px-3 py-2.5 font-display text-xs font-bold text-primary-foreground disabled:opacity-40">
              Создать
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setMode('browse')}
              className="rounded-lg bg-secondary px-4 py-2.5 font-display text-xs font-bold text-muted-foreground">
              Назад
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // BROWSE VIEW
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-gold flex items-center gap-2">
          <Shield className="h-5 w-5" /> Гильдии
        </h3>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setMode('create')}
          className="rounded-lg bg-gradient-gold px-3 py-2 font-display text-[10px] font-bold text-primary-foreground flex items-center gap-1">
          <Plus className="h-3 w-3" /> Создать
        </motion.button>
      </div>

      {allGuilds.length === 0 ? (
        <div className="text-center py-8">
          <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Пока нет гильдий. Создайте первую!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {allGuilds.map(guild => (
            <motion.div key={guild.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-border bg-gradient-card p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{guild.icon}</span>
                  <div>
                    <p className="font-display text-sm font-bold text-foreground">{guild.name}</p>
                    <p className="text-[10px] text-muted-foreground">Ур. {guild.level}</p>
                  </div>
                </div>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => joinGuild(guild.id)}
                  className="rounded-lg bg-gradient-crimson px-3 py-2 font-display text-[10px] font-bold text-accent-foreground flex items-center gap-1">
                  <Plus className="h-3 w-3" /> Вступить
                </motion.button>
              </div>
              {guild.description && <p className="text-[10px] text-muted-foreground mt-1">{guild.description}</p>}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GuildScreen;

import { View, Text, ActivityIndicator, Platform, ViewStyle } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useClientExercises } from '../../hooks/useClientExercises';
import { useTheme } from '../../contexts/ThemeContext';
import { useCallback, useEffect, useMemo, useState } from 'react';
import i18n from '../../utils/i18n';
import Animated, { useAnimatedScrollHandler, useSharedValue, useAnimatedStyle, interpolate, Extrapolate } from 'react-native-reanimated';
import { ChevronLeft, BookOpen, Clock3, CheckCircle2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { OpenExerciseCard } from '../../components/dashboard/OpenExerciseCard';
import { CompletedExerciseCard } from '../../components/dashboard/CompletedExerciseCard';
import { EmptyState } from '../../components/dashboard/EmptyState';
import { ClientMetricCard } from '../../components/dashboard/ClientMetricCard';
import { DashboardSectionHeader } from '../../components/dashboard/DashboardSectionHeader';
import { MotiView } from 'moti';
import { Skeleton } from '../../components/ui/Skeleton';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { PressableScale } from '../../components/ui/PressableScale';

type ExerciseFilter = 'all' | 'open' | 'completed';

const parseExerciseFilter = (value: string | string[] | undefined): ExerciseFilter => {
    const normalized = Array.isArray(value) ? value[0] : value;
    if (normalized === 'all' || normalized === 'completed') {
        return normalized;
    }
    return 'open';
};

export default function ExercisesOverview() {
    const { profile } = useAuth();
    const router = useRouter();
    const { filter } = useLocalSearchParams<{ filter?: string | string[] }>();
    const { exercises, loading, fetchExercises } = useClientExercises(profile?.id);
    const { colors, isDark } = useTheme();

    const { isXs, isSm, isTablet, isDesktop, contentMaxWidth, gutter, sectionGap, headerTop } = useResponsiveLayout();
    const contentWrapperStyle: ViewStyle = contentMaxWidth
        ? { width: '100%', maxWidth: contentMaxWidth, alignSelf: 'center' }
        : { width: '100%' };

    const openExercises = useMemo(() => exercises.filter(ex => !ex.completed), [exercises]);
    const completedExercises = useMemo(() => exercises.filter(ex => ex.completed), [exercises]);
    const [activeFilter, setActiveFilter] = useState<ExerciseFilter>(() => parseExerciseFilter(filter));

    useEffect(() => {
        setActiveFilter(parseExerciseFilter(filter));
    }, [filter]);

    const visibleOpenExercises = activeFilter === 'completed' ? [] : openExercises;
    const visibleCompletedExercises = activeFilter === 'open' ? [] : completedExercises;
    const filterOptions: Array<{ key: ExerciseFilter; label: string; count: number }> = [
        { key: 'all', label: i18n.t('dashboard.stats.total', { defaultValue: 'Gesamt' }), count: exercises.length },
        { key: 'open', label: i18n.t('dashboard.stats.open', { defaultValue: 'Offen' }), count: openExercises.length },
        { key: 'completed', label: i18n.t('dashboard.stats.completed', { defaultValue: 'Erledigt' }), count: completedExercises.length },
    ];

    const emptyFilterMessage =
        activeFilter === 'open'
            ? 'Keine offenen Übungen.'
            : activeFilter === 'completed'
                ? 'Noch keine erledigten Übungen.'
                : 'Derzeit sind keine Übungen verfügbar.';

    useFocusEffect(
        useCallback(() => {
            fetchExercises();
        }, [fetchExercises])
    );

    const scrollY = useSharedValue(0);
    const scrollHandler = useAnimatedScrollHandler((event) => {
        scrollY.value = event.contentOffset.y;
    });

    const headerAnimatedStyle = useAnimatedStyle(() => {
        const height = interpolate(scrollY.value, [0, 120], [Platform.OS === 'android' ? 120 : 130, Platform.OS === 'android' ? 72 : 84], Extrapolate.CLAMP);
        const padding = interpolate(scrollY.value, [0, 120], [headerTop - 8, Platform.OS === 'android' ? 20 : 28], Extrapolate.CLAMP);
        return {
            width: '100%',
            height,
            paddingTop: padding,
            paddingBottom: 24,
            paddingHorizontal: gutter,
            borderBottomLeftRadius: isSm ? 28 : 36,
            borderBottomRightRadius: isSm ? 28 : 36,
            overflow: 'hidden',
            zIndex: 10,
            shadowColor: colors.primaryDark,
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.15,
            shadowRadius: 24,
            elevation: 8,
            flexDirection: isXs ? 'column' as const : 'row' as const,
            alignItems: isXs ? 'flex-start' as const : 'center' as const,
            justifyContent: 'space-between' as const,
            gap: isXs ? 12 : 0,
            opacity: interpolate(scrollY.value, [0, 80, 140], [1, 0.6, 0], Extrapolate.CLAMP),
            transform: [
                {
                    translateY: interpolate(scrollY.value, [0, 140], [0, -22], Extrapolate.CLAMP),
                },
            ],
        };
    });

    const handleBackPress = useCallback(() => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
        }
        if (typeof router.canGoBack === 'function' && router.canGoBack()) {
            router.back();
        } else {
            router.push('/(app)' as any);
        }
    }, [router]);

    if (loading && exercises.length === 0) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                <View style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.primary, paddingTop: headerTop, paddingBottom: 56, paddingHorizontal: gutter, borderBottomLeftRadius: 48, borderBottomRightRadius: 48 }}>
                    <Skeleton width={200} height={34} borderRadius={8} />
                    <Skeleton width={140} height={16} borderRadius={4} style={{ marginTop: 12 }} />
                </View>
                <View style={{ padding: gutter }}>
                    <Skeleton width="100%" height={140} borderRadius={24} style={{ marginBottom: 24 }} />
                    <Skeleton width={180} height={24} borderRadius={6} style={{ marginBottom: 16 }} />
                    <Skeleton width="100%" height={100} borderRadius={20} style={{ marginBottom: 12 }} />
                </View>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <Animated.View style={[headerAnimatedStyle]}>
                <LinearGradient
                    colors={[colors.primaryDark, colors.primary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                />
                <View
                    style={[
                        contentWrapperStyle,
                        {
                            flexDirection: isXs ? 'column' : 'row',
                            alignItems: isXs ? 'flex-start' : 'center',
                            justifyContent: 'space-between',
                            gap: isXs ? 12 : 0,
                            zIndex: 50,
                        },
                    ]}
                >
                    <PressableScale
                        accessibilityRole="button"
                        accessibilityLabel={i18n.t('exercise.back', { defaultValue: 'Zurück' })}
                        onPress={handleBackPress}
                        withHaptics={false}
                        intensity="subtle"
                        style={{
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            paddingHorizontal: isXs ? 12 : 16,
                            paddingVertical: 12,
                            borderRadius: 16,
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                    >
                        <ChevronLeft size={20} color="white" />
                        <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 4 }}>
                            {i18n.t('exercise.back', { defaultValue: 'Zurück' })}
                        </Text>
                    </PressableScale>
                    <Text
                        style={{
                            fontSize: isXs ? 20 : 22,
                            fontWeight: '900',
                            color: 'white',
                            flex: 1,
                            textAlign: isXs ? 'left' : 'right',
                            marginLeft: isXs ? 0 : 16,
                            letterSpacing: -0.5
                        }}
                        numberOfLines={1}
                    >
                        {i18n.t('dashboard.exercises.title', { defaultValue: 'Übungen' })}
                    </Text>
                </View>
            </Animated.View>

            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingTop: 24, paddingBottom: 56 }}
                style={{ flex: 1 }}
            >
                <View style={[contentWrapperStyle, { paddingHorizontal: gutter }]}>
                    <View style={{ flexDirection: isTablet ? 'row' : 'column', gap: sectionGap, marginBottom: 24 }}>
                        <PressableScale
                            accessibilityRole="button"
                            accessibilityState={{ selected: activeFilter === 'all' }}
                            onPress={() => {
                                if (Platform.OS !== 'web') {
                                    Haptics.selectionAsync();
                                }
                                setActiveFilter('all');
                            }}
                            withHaptics={false}
                            intensity="medium"
                            style={[
                                { flex: 1 },
                                activeFilter === 'all' && {
                                    borderRadius: 28,
                                    borderWidth: 2,
                                    borderColor: colors.primary,
                                },
                            ]}
                        >
                            <ClientMetricCard
                                icon={BookOpen}
                                label="Gesamt"
                                value={String(exercises.length)}
                                hint={exercises.length === 0 ? 'Derzeit sind keine Übungen verfügbar.' : 'Alle dir zugewiesenen Übungen in einer Ansicht.'}
                                tone="primary"
                            />
                        </PressableScale>
                        <PressableScale
                            accessibilityRole="button"
                            accessibilityState={{ selected: activeFilter === 'open' }}
                            onPress={() => {
                                if (Platform.OS !== 'web') {
                                    Haptics.selectionAsync();
                                }
                                setActiveFilter('open');
                            }}
                            withHaptics={false}
                            intensity="medium"
                            style={[
                                { flex: 1 },
                                activeFilter === 'open' && {
                                    borderRadius: 28,
                                    borderWidth: 2,
                                    borderColor: colors.primary,
                                },
                            ]}
                        >
                            <ClientMetricCard
                                icon={Clock3}
                                label="Offen"
                                value={String(openExercises.length)}
                                hint={openExercises.length === 0 ? 'Alle Aufgaben sind aktuell abgeschlossen.' : 'Hier liegen deine nächsten Schritte.'}
                                tone="secondary"
                            />
                        </PressableScale>
                        <PressableScale
                            accessibilityRole="button"
                            accessibilityState={{ selected: activeFilter === 'completed' }}
                            onPress={() => {
                                if (Platform.OS !== 'web') {
                                    Haptics.selectionAsync();
                                }
                                setActiveFilter('completed');
                            }}
                            withHaptics={false}
                            intensity="medium"
                            style={[
                                { flex: 1 },
                                activeFilter === 'completed' && {
                                    borderRadius: 28,
                                    borderWidth: 2,
                                    borderColor: colors.primary,
                                },
                            ]}
                        >
                            <ClientMetricCard
                                icon={CheckCircle2}
                                label="Abgeschlossen"
                                value={String(completedExercises.length)}
                                hint="Erledigte Übungen bleiben für Wiederholung und Rückblick erhalten."
                                tone="success"
                            />
                        </PressableScale>
                    </View>

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
                        {filterOptions.map((option) => {
                            const isActive = activeFilter === option.key;
                            return (
                                <PressableScale
                                    key={option.key}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: isActive }}
                                    onPress={() => {
                                        if (Platform.OS !== 'web') {
                                            Haptics.selectionAsync();
                                        }
                                        setActiveFilter(option.key);
                                    }}
                                    withHaptics={false}
                                    intensity="subtle"
                                    style={{
                                        paddingHorizontal: 14,
                                        paddingVertical: 10,
                                        borderRadius: 999,
                                        borderWidth: 1,
                                        borderColor: isActive ? colors.primary : colors.border,
                                        backgroundColor: isActive
                                            ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(17,24,39,0.06)')
                                            : colors.card,
                                    }}
                                >
                                    <Text style={{ color: isActive ? colors.primary : colors.text, fontWeight: '800' }}>
                                        {option.label} ({option.count})
                                    </Text>
                                </PressableScale>
                            );
                        })}
                    </View>

                    {exercises.length === 0 ? (
                        <MotiView
                            from={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'timing', duration: 300 }}
                        >
                            <EmptyState />
                        </MotiView>
                    ) : (
                        <>
                            {visibleOpenExercises.length > 0 ? (
                                <View style={{ marginBottom: 32 }}>
                                    <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 300 }}>
                                        <DashboardSectionHeader
                                            title={i18n.t('dashboard.exercises.title', { defaultValue: 'Offen' })}
                                            subtitle={`${visibleOpenExercises.length} offene Aufgabe${visibleOpenExercises.length > 1 ? 'n' : ''} warten auf dich.`}
                                        />
                                    </MotiView>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8 }}>
                                        {visibleOpenExercises.map((ex, idx) => {
                                            const itemWidth = isDesktop ? '33.33%' : isTablet ? '50%' : '100%';
                                            return (
                                                <MotiView
                                                    key={ex.id}
                                                    from={{ opacity: 0, translateY: 30 }}
                                                    animate={{ opacity: 1, translateY: 0 }}
                                                    transition={{ type: 'timing', duration: 350, delay: (idx % 10) * 50 }}
                                                    style={{ width: itemWidth as any, paddingHorizontal: 8, paddingBottom: 16 }}
                                                >
                                                    <OpenExerciseCard exercise={ex} onPress={() => router.push(`/(app)/exercise/${ex.id}` as any)} />
                                                </MotiView>
                                            );
                                        })}
                                    </View>
                                </View>
                            ) : null}

                            {visibleCompletedExercises.length > 0 ? (
                                <View>
                                    <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 300 }}>
                                        <View style={{ marginTop: 8 }}>
                                            <DashboardSectionHeader
                                                title={i18n.t('dashboard.completed.title', { defaultValue: 'Abgeschlossen' })}
                                                subtitle={`${visibleCompletedExercises.length} erledigte Aufgabe${visibleCompletedExercises.length > 1 ? 'n' : ''} kannst du jederzeit wieder öffnen.`}
                                            />
                                        </View>
                                    </MotiView>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8 }}>
                                        {visibleCompletedExercises.map((ex, idx) => {
                                            const itemWidth = isDesktop ? '33.33%' : isTablet ? '50%' : '100%';
                                            return (
                                                <MotiView
                                                    key={ex.id}
                                                    from={{ opacity: 0, translateY: 30 }}
                                                    animate={{ opacity: 1, translateY: 0 }}
                                                    transition={{ type: 'timing', duration: 350, delay: (idx % 10) * 50 }}
                                                    style={{ width: itemWidth as any, paddingHorizontal: 8, paddingBottom: 16 }}
                                                >
                                                    <CompletedExerciseCard exercise={ex} onPress={() => router.push(`/(app)/exercise/${ex.id}` as any)} />
                                                </MotiView>
                                            );
                                        })}
                                    </View>
                                </View>
                            ) : null}

                            {activeFilter !== 'all' &&
                            visibleOpenExercises.length === 0 &&
                            visibleCompletedExercises.length === 0 ? (
                                <View
                                    style={{
                                        borderRadius: 24,
                                        padding: 20,
                                        backgroundColor: colors.card,
                                        borderWidth: 1,
                                        borderColor: colors.border,
                                    }}
                                >
                                    <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: 6 }}>
                                        {activeFilter === 'open' ? 'Offene Aufgaben' : 'Erledigte Aufgaben'}
                                    </Text>
                                    <Text style={{ color: colors.textSubtle, lineHeight: 22 }}>
                                        {emptyFilterMessage}
                                    </Text>
                                </View>
                            ) : null}
                        </>
                    )}
                </View>
            </Animated.ScrollView>
        </View>
    );
} 
